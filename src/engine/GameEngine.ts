import type {
  GameState, PlayerTank, EnemyTank, Bullet, PowerUp, Explosion, Particle,
  SpawnEffect, LevelConfig, PlayerIndex, GameMode, Point,
} from '../types/game';
import { GamePhase, Direction, TileType, EnemyType, PowerUpType } from '../types/game';
import { InputManager } from './InputManager';
import {
  canMove, entityOverlap, bulletTileCollision, directionDelta,
  snapToGrid, isOutOfBounds, tanksCollide, getOverlappingTiles,
} from './CollisionSystem';
import {
  decideDirection, getAIDirectionInterval, shouldShoot,
  getBossPhase, getBossExtraDirections, getBossSpeedMultiplier,
  getBossFireRateMultiplier,
} from './EnemyAI';
import { shouldDropPowerUp, getRandomPowerUpType, getRandomPowerUpPosition } from './PowerUpSystem';
import * as C from '../constants/config';

let nextId = 0;
/** Generate a unique entity ID. */
function uid(): string { return `e${nextId++}`; }

/** Payload sent from engine to React UI layer via callback. */
export interface UICallbackData {
  phase: GamePhase;
  scores: number[];
  lives: number[];
  currentLevel: number;
  enemiesRemaining: number;
  gameMode: GameMode;
  playersInfo: Array<{ hasShield: boolean; speedBoost: boolean; firepowerLevel: number } | null>;
}

/** Callback type for engine-to-UI state synchronization. */
export type UICallback = (state: UICallbackData) => void;

/**
 * Core game engine that manages game state, input processing, entity updates,
 * collision detection, and game phase transitions. Supports 1P and 2P modes.
 */
export class GameEngine {
  state: GameState;
  input: InputManager;
  levels: LevelConfig[];
  private animFrameId: number = 0;
  private lastTime: number = 0;
  private uiCallback: UICallback | null = null;
  private running: boolean = false;

  constructor(levels: LevelConfig[]) {
    this.levels = levels;
    this.input = new InputManager();
    this.state = this.createInitialState();
  }

  /**
   * Create the default initial game state for the start screen.
   * @returns A fresh GameState with all fields at defaults
   */
  private createInitialState(): GameState {
    return {
      phase: GamePhase.START_SCREEN,
      currentLevel: 0,
      scores: [0],
      lives: [C.PLAYER_INITIAL_LIVES],
      players: [],
      enemies: [],
      bullets: [],
      powerUps: [],
      explosions: [],
      particles: [],
      spawnEffects: [],
      mapData: [],
      brickHealth: [],
      baseDestroyed: false,
      enemySpawnQueue: [],
      enemySpawnTimer: 0,
      enemiesOnField: 0,
      freezeTimer: 0,
      stageIntroTimer: 0,
      levelCompleteTimer: 0,
      gameOverTimer: 0,
      gameMode: 1,
      menuSelection: 1,
    };
  }

  /**
   * Register the UI callback for state synchronization.
   * @param cb - Callback invoked on every meaningful state change
   */
  setUICallback(cb: UICallback): void {
    this.uiCallback = cb;
  }

  /** Send current state snapshot to the UI layer. */
  private notifyUI(): void {
    if (!this.uiCallback) return;
    const s = this.state;
    const playersInfo = this.buildPlayersInfo();
    this.uiCallback({
      phase: s.phase,
      scores: s.scores,
      lives: s.lives,
      currentLevel: s.currentLevel,
      enemiesRemaining: s.enemySpawnQueue.length + s.enemies.length,
      gameMode: s.gameMode,
      playersInfo,
    });
  }

  /**
   * Build power-up info array for UI, one entry per possible player slot.
   * @returns Array with info for each player index (null if player is dead/absent)
   */
  private buildPlayersInfo(): UICallbackData['playersInfo'] {
    const s = this.state;
    const count = s.gameMode === 2 ? 2 : 1;
    const result: UICallbackData['playersInfo'] = [];
    for (let i = 0; i < count; i++) {
      const player = s.players.find(p => p.playerIndex === i);
      if (player) {
        result.push({
          hasShield: player.hasShield,
          speedBoost: player.speedBoostTimer > 0,
          firepowerLevel: player.firepowerLevel,
        });
      } else {
        result.push(null);
      }
    }
    return result;
  }

  /** Start the game engine: attach input and begin the update loop. */
  start(): void {
    this.input.attach();
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  /** Stop the game engine: detach input and cancel the update loop. */
  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.animFrameId);
    this.input.detach();
  }

  /** Main game loop driven by requestAnimationFrame. */
  private loop = (time: number): void => {
    if (!this.running) return;
    const dt = Math.min(time - this.lastTime, 50);
    this.lastTime = time;
    this.input.update();
    this.update(dt);
    this.animFrameId = requestAnimationFrame(this.loop);
  };

  // ============ UPDATE ============

  /**
   * Top-level update dispatcher. Routes to phase-specific handlers.
   * @param dt - Delta time in milliseconds since last frame
   */
  private update(dt: number): void {
    const s = this.state;

    switch (s.phase) {
      case GamePhase.START_SCREEN:
        this.updateStartScreen();
        break;

      case GamePhase.STAGE_INTRO:
        s.stageIntroTimer -= dt;
        if (s.stageIntroTimer <= 0) {
          s.phase = GamePhase.PLAYING;
          this.notifyUI();
        }
        break;

      case GamePhase.PLAYING:
        if (this.input.wasJustPressed('Escape') || this.input.wasJustPressed('KeyP')) {
          s.phase = GamePhase.PAUSED;
          this.notifyUI();
          break;
        }
        this.updatePlaying(dt / 1000, dt);
        break;

      case GamePhase.PAUSED:
        if (this.input.wasJustPressed('Escape') || this.input.wasJustPressed('KeyP')) {
          s.phase = GamePhase.PLAYING;
          this.notifyUI();
        }
        break;

      case GamePhase.LEVEL_COMPLETE:
        s.levelCompleteTimer -= dt;
        if (s.levelCompleteTimer <= 0) {
          this.nextLevel();
        }
        break;

      case GamePhase.GAME_OVER:
        s.gameOverTimer -= dt;
        if (s.gameOverTimer <= 0 && this.input.wasJustPressed('Enter')) {
          this.state = this.createInitialState();
          this.notifyUI();
        }
        break;
    }
  }

  /** Handle start screen input: menu selection and game start. */
  private updateStartScreen(): void {
    const s = this.state;
    if (this.input.wasJustPressed('ArrowUp') || this.input.wasJustPressed('KeyW') ||
        this.input.wasJustPressed('ArrowDown') || this.input.wasJustPressed('KeyS')) {
      s.menuSelection = s.menuSelection === 1 ? 2 : 1;
      this.notifyUI();
    }
    if (this.input.wasJustPressed('Enter') || this.input.wasJustPressed('Space')) {
      this.startGame(s.menuSelection);
    }
  }

  /**
   * Per-frame update during PLAYING phase. Processes all game systems.
   * @param dtSec - Delta time in seconds
   * @param dtMs - Delta time in milliseconds
   */
  private updatePlaying(dtSec: number, dtMs: number): void {
    const s = this.state;

    if (s.freezeTimer > 0) {
      s.freezeTimer -= dtMs;
    }

    for (const player of s.players) {
      this.updatePlayerByIndex(player, dtSec, dtMs);
    }

    if (s.freezeTimer <= 0) {
      this.updateEnemies(dtSec, dtMs);
    }

    this.updateEnemySpawning(dtMs);
    this.updateBullets(dtSec);
    this.updatePowerUps(dtMs);
    this.updateEffects(dtMs);
    this.updateSpawnEffects(dtMs);
    this.checkWinLose();
    this.notifyUI();
  }

  // ============ PLAYER ============

  /**
   * Update a specific player's movement, shooting, and status timers.
   * @param player - The player tank to update
   * @param dtSec - Delta time in seconds
   * @param dtMs - Delta time in milliseconds
   */
  private updatePlayerByIndex(player: PlayerTank, dtSec: number, dtMs: number): void {
    if (player.isRespawning) {
      this.updatePlayerRespawn(player, dtMs);
      return;
    }

    this.updatePlayerTimers(player, dtMs);

    if (player.spawnAnimation > 0) {
      player.spawnAnimation -= dtMs;
      return;
    }

    this.updatePlayerMovement(player, dtSec);
    this.updatePlayerShooting(player);
  }

  /**
   * Handle player respawn countdown.
   * @param player - The respawning player
   * @param dtMs - Delta time in milliseconds
   */
  private updatePlayerRespawn(player: PlayerTank, dtMs: number): void {
    player.respawnTimer -= dtMs;
    if (player.respawnTimer <= 0) {
      player.isRespawning = false;
      player.hasShield = true;
      player.shieldTimer = 3000;
    }
  }

  /**
   * Tick down shield and speed boost timers for a player.
   * @param player - The player to update
   * @param dtMs - Delta time in milliseconds
   */
  private updatePlayerTimers(player: PlayerTank, dtMs: number): void {
    if (player.hasShield) {
      player.shieldTimer -= dtMs;
      if (player.shieldTimer <= 0) player.hasShield = false;
    }
    if (player.speedBoostTimer > 0) {
      player.speedBoostTimer -= dtMs;
      if (player.speedBoostTimer <= 0) {
        player.speed = player.baseSpeed;
      }
    }
  }

  /**
   * Process movement input and apply collision-checked displacement for a player.
   * @param player - The player tank to move
   * @param dtSec - Delta time in seconds
   */
  private updatePlayerMovement(player: PlayerTank, dtSec: number): void {
    const newDir = this.input.getPlayerDirection(player.playerIndex);
    player.isMoving = newDir !== null;

    if (newDir === null) return;

    if (newDir !== player.direction) {
      if (newDir === Direction.UP || newDir === Direction.DOWN) {
        player.x = snapToGrid(player.x);
      } else {
        player.y = snapToGrid(player.y);
      }
    }
    player.direction = newDir;

    const { dx, dy } = directionDelta(newDir);
    const moveX = dx * player.speed * dtSec;
    const moveY = dy * player.speed * dtSec;

    const otherTanks = this.getOtherTanksForPlayer(player);
    if (canMove(player, moveX, moveY, this.state.mapData) &&
        !tanksCollide(player, moveX, moveY, otherTanks)) {
      player.x += moveX;
      player.y += moveY;
    }
  }

  /**
   * Get all tanks that should block a player's movement (enemies + other players).
   * @param player - The player to exclude from the result
   * @returns Array of blocking tank entities
   */
  private getOtherTanksForPlayer(player: PlayerTank): (EnemyTank | PlayerTank)[] {
    const s = this.state;
    const activeEnemies = s.enemies.filter(e => !e.frozen || s.freezeTimer <= 0);
    const otherPlayers = s.players.filter(
      p => p.playerIndex !== player.playerIndex && !p.isRespawning
    );
    return [...activeEnemies, ...otherPlayers];
  }

  /**
   * Process fire input and create bullets for a player.
   * @param player - The player tank to check firing for
   */
  private updatePlayerShooting(player: PlayerTank): void {
    if (!this.input.isPlayerFiring(player.playerIndex)) return;

    const now = performance.now();
    const effectiveFireRate = player.firepowerLevel >= 1
      ? player.fireRate * 0.6
      : player.fireRate;

    if (now - player.lastFireTime >= effectiveFireRate) {
      this.fireBullet(player, true);
      player.lastFireTime = now;
    }
  }

  // ============ ENEMIES ============

  /**
   * Update all enemy tanks: AI decisions, movement, and shooting.
   * @param dtSec - Delta time in seconds
   * @param dtMs - Delta time in milliseconds
   */
  private updateEnemies(dtSec: number, dtMs: number): void {
    const s = this.state;

    for (const enemy of s.enemies) {
      if (enemy.frozen && s.freezeTimer > 0) continue;
      enemy.frozen = false;

      this.updateEnemyAI(enemy, dtMs);
      this.updateEnemyMovement(enemy, dtSec);
      this.updateEnemyShooting(enemy, dtMs);

      if (enemy.spawnAnimation > 0) {
        enemy.spawnAnimation -= dtMs;
      }
    }
  }

  /**
   * Update enemy AI direction decision timer.
   * @param enemy - The enemy tank
   * @param dtMs - Delta time in milliseconds
   */
  private updateEnemyAI(enemy: EnemyTank, dtMs: number): void {
    enemy.aiTimer -= dtMs;
    if (enemy.aiTimer <= 0) {
      const target = this.findNearestAlivePlayer(enemy);
      enemy.direction = decideDirection(
        enemy,
        target ? target.x : null,
        target ? target.y : null,
      );
      enemy.aiTimer = getAIDirectionInterval(enemy.enemyType);
    }
  }

  /**
   * Find the nearest alive (non-respawning) player to an enemy.
   * @param enemy - The enemy tank searching for a target
   * @returns The nearest alive PlayerTank, or null if none exist
   */
  private findNearestAlivePlayer(enemy: EnemyTank): PlayerTank | null {
    const alivePlayers = this.state.players.filter(p => !p.isRespawning);
    if (alivePlayers.length === 0) return null;

    let nearest: PlayerTank = alivePlayers[0];
    let nearestDist = this.distanceSq(enemy, nearest);

    for (let i = 1; i < alivePlayers.length; i++) {
      const dist = this.distanceSq(enemy, alivePlayers[i]);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = alivePlayers[i];
      }
    }
    return nearest;
  }

  /**
   * Compute squared distance between two entities (avoids sqrt).
   * @param a - First entity
   * @param b - Second entity
   * @returns Squared Euclidean distance between entity centers
   */
  private distanceSq(a: { x: number; y: number }, b: { x: number; y: number }): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  /**
   * Apply movement to an enemy with collision checking.
   * @param enemy - The enemy tank to move
   * @param dtSec - Delta time in seconds
   */
  private updateEnemyMovement(enemy: EnemyTank, dtSec: number): void {
    const s = this.state;
    let speedMult = 1;
    if (enemy.enemyType === EnemyType.BOSS) {
      speedMult = getBossSpeedMultiplier(getBossPhase(enemy));
    }

    const { dx, dy } = directionDelta(enemy.direction);
    const moveX = dx * enemy.speed * speedMult * dtSec;
    const moveY = dy * enemy.speed * speedMult * dtSec;

    const otherTanks = [
      ...s.enemies.filter(e => e.id !== enemy.id),
      ...s.players.filter(p => !p.isRespawning),
    ];

    if (canMove(enemy, moveX, moveY, s.mapData) &&
        !tanksCollide(enemy, moveX, moveY, otherTanks)) {
      enemy.x += moveX;
      enemy.y += moveY;
      enemy.isMoving = true;
    } else {
      enemy.isMoving = false;
      enemy.direction = decideDirection(enemy, null, null);
      enemy.aiTimer = getAIDirectionInterval(enemy.enemyType);
    }
  }

  /**
   * Handle enemy shooting logic including boss spread shots.
   * @param enemy - The enemy tank
   * @param dtMs - Delta time in milliseconds
   */
  private updateEnemyShooting(enemy: EnemyTank, dtMs: number): void {
    if (!shouldShoot(enemy, dtMs)) return;

    let fireRateMult = 1;
    if (enemy.enemyType === EnemyType.BOSS) {
      fireRateMult = getBossFireRateMultiplier(getBossPhase(enemy));
    }
    enemy.aiShootTimer *= fireRateMult;
    this.fireBullet(enemy, false);

    if (enemy.enemyType === EnemyType.BOSS) {
      const phase = getBossPhase(enemy);
      const extraDirs = getBossExtraDirections(phase, enemy.direction);
      for (const dir of extraDirs) {
        this.fireBulletInDirection(enemy, false, dir);
      }
    }
  }

  /**
   * Spawn queued enemies when conditions allow.
   * @param dtMs - Delta time in milliseconds
   */
  private updateEnemySpawning(dtMs: number): void {
    const s = this.state;
    const level = this.levels[s.currentLevel];
    if (!level) return;

    if (s.enemySpawnQueue.length === 0) return;
    if (s.enemies.length >= level.maxEnemiesOnField) return;

    s.enemySpawnTimer -= dtMs;
    if (s.enemySpawnTimer <= 0) {
      s.enemySpawnTimer = C.ENEMY_SPAWN_INTERVAL;
      this.spawnNextEnemy();
    }
  }

  /** Attempt to spawn the next enemy from the queue at a clear spawn point. */
  private spawnNextEnemy(): void {
    const s = this.state;
    const level = this.levels[s.currentLevel];
    if (!level || s.enemySpawnQueue.length === 0) return;

    const type = s.enemySpawnQueue.shift()!;
    const spawnPoint = level.enemySpawnPoints[
      Math.floor(Math.random() * level.enemySpawnPoints.length)
    ];

    const spawnBox = {
      x: spawnPoint.x, y: spawnPoint.y,
      width: C.TANK_SIZE, height: C.TANK_SIZE,
    };
    const allTanks = [...s.enemies, ...s.players];
    if (tanksCollide(
      { x: spawnBox.x - 1, y: spawnBox.y - 1, width: spawnBox.width, height: spawnBox.height },
      0, 0, allTanks,
    )) {
      s.enemySpawnQueue.unshift(type);
      s.enemySpawnTimer = 500;
      return;
    }

    const config = C.ENEMY_CONFIG[type];
    const hasPowerUp = Math.random() < 0.2;

    const enemy: EnemyTank = {
      id: uid(),
      x: spawnPoint.x,
      y: spawnPoint.y,
      width: C.TANK_SIZE,
      height: C.TANK_SIZE,
      direction: Direction.DOWN,
      speed: config.speed,
      health: config.health,
      maxHealth: config.health,
      fireRate: config.fireRate,
      lastFireTime: 0,
      bulletSpeed: config.bulletSpeed,
      bulletPower: config.bulletPower,
      isMoving: false,
      spawnAnimation: C.SPAWN_ANIMATION_DURATION,
      enemyType: type,
      aiTimer: getAIDirectionInterval(type),
      aiShootTimer: config.fireRate,
      hasPowerUp,
      frozen: false,
      frozenTimer: 0,
    };

    s.enemies.push(enemy);
    s.spawnEffects.push({
      id: uid(),
      x: spawnPoint.x + C.TANK_SIZE / 2,
      y: spawnPoint.y + C.TANK_SIZE / 2,
      timer: C.SPAWN_ANIMATION_DURATION,
      maxTimer: C.SPAWN_ANIMATION_DURATION,
    });
  }

  // ============ BULLETS ============

  /**
   * Fire a bullet in the tank's current direction.
   * @param tank - The tank firing the bullet
   * @param isPlayer - Whether this is a player bullet
   */
  private fireBullet(tank: PlayerTank | EnemyTank, isPlayer: boolean): void {
    this.fireBulletInDirection(tank, isPlayer, tank.direction);
  }

  /**
   * Fire a bullet in a specified direction from a tank.
   * @param tank - The tank firing
   * @param isPlayer - Whether this is a player bullet
   * @param direction - The direction to fire in
   */
  private fireBulletInDirection(
    tank: PlayerTank | EnemyTank,
    isPlayer: boolean,
    direction: Direction,
  ): void {
    const s = this.state;

    const existingBullets = s.bullets.filter(b => b.ownerId === tank.id);
    const maxBullets = isPlayer && 'firepowerLevel' in tank && tank.firepowerLevel >= 2 ? 2 : 1;
    if (existingBullets.length >= maxBullets) return;

    const { dx, dy } = directionDelta(direction);
    const bx = tank.x + tank.width / 2 - C.BULLET_SIZE / 2 + dx * (tank.width / 2);
    const by = tank.y + tank.height / 2 - C.BULLET_SIZE / 2 + dy * (tank.height / 2);

    const bullet: Bullet = {
      id: uid(),
      x: bx,
      y: by,
      width: C.BULLET_SIZE,
      height: C.BULLET_SIZE,
      direction,
      speed: tank.bulletSpeed,
      power: tank.bulletPower,
      ownerId: tank.id,
      isPlayerBullet: isPlayer,
    };

    s.bullets.push(bullet);
  }

  /**
   * Update all bullets: movement, tile collision, entity collision.
   * @param dtSec - Delta time in seconds
   */
  private updateBullets(dtSec: number): void {
    const s = this.state;
    const toRemove: Set<string> = new Set();

    for (const bullet of s.bullets) {
      const { dx, dy } = directionDelta(bullet.direction);
      bullet.x += dx * bullet.speed * dtSec;
      bullet.y += dy * bullet.speed * dtSec;

      if (isOutOfBounds(bullet)) {
        toRemove.add(bullet.id);
        continue;
      }

      if (this.handleBulletTileCollision(bullet, toRemove)) continue;

      if (bullet.isPlayerBullet) {
        this.handlePlayerBulletVsEnemies(bullet, toRemove);
      } else {
        this.handleEnemyBulletVsPlayers(bullet, toRemove);
      }

      this.handleBulletVsBullet(bullet, toRemove);
    }

    s.bullets = s.bullets.filter(b => !toRemove.has(b.id));
  }

  /**
   * Check if a bullet hit a map tile and apply damage.
   * @param bullet - The bullet to check
   * @param toRemove - Set of bullet IDs to remove this frame
   * @returns true if the bullet hit a tile and should stop processing
   */
  private handleBulletTileCollision(bullet: Bullet, toRemove: Set<string>): boolean {
    const s = this.state;
    const tileHit = bulletTileCollision(bullet, s.mapData);
    if (!tileHit) return false;

    toRemove.add(bullet.id);
    if (tileHit.tileType === TileType.BRICK) {
      this.destroyBrick(tileHit.row, tileHit.col);
      this.addExplosion(bullet.x, bullet.y, false);
    } else if (tileHit.tileType === TileType.STEEL) {
      if (bullet.power >= 3) {
        s.mapData[tileHit.row][tileHit.col] = TileType.EMPTY;
      }
      this.addExplosion(bullet.x, bullet.y, false);
    } else if (tileHit.tileType === TileType.BASE) {
      s.baseDestroyed = true;
      s.mapData[tileHit.row][tileHit.col] = TileType.EMPTY;
      this.addExplosion(
        tileHit.col * C.TILE_SIZE + C.TILE_SIZE / 2,
        tileHit.row * C.TILE_SIZE + C.TILE_SIZE / 2,
        true,
      );
    }
    return true;
  }

  /**
   * Check if a player bullet hit any enemy.
   * @param bullet - The player's bullet
   * @param toRemove - Set of bullet IDs to remove
   */
  private handlePlayerBulletVsEnemies(bullet: Bullet, toRemove: Set<string>): void {
    const s = this.state;
    for (const enemy of s.enemies) {
      if (enemy.spawnAnimation > 0) continue;
      if (entityOverlap(bullet, enemy)) {
        toRemove.add(bullet.id);
        enemy.health -= bullet.power;
        if (enemy.health <= 0) {
          const killerIndex = this.findBulletOwnerPlayerIndex(bullet);
          this.killEnemy(enemy, killerIndex);
        } else {
          this.addExplosion(bullet.x, bullet.y, false);
        }
        break;
      }
    }
  }

  /**
   * Determine which player fired a bullet by matching ownerId.
   * @param bullet - The bullet to trace
   * @returns The PlayerIndex of the owner, or 0 as fallback
   */
  private findBulletOwnerPlayerIndex(bullet: Bullet): PlayerIndex {
    const owner = this.state.players.find(p => p.id === bullet.ownerId);
    return owner ? owner.playerIndex : 0;
  }

  /**
   * Check if an enemy bullet hit any player.
   * @param bullet - The enemy's bullet
   * @param toRemove - Set of bullet IDs to remove
   */
  private handleEnemyBulletVsPlayers(bullet: Bullet, toRemove: Set<string>): void {
    for (const player of this.state.players) {
      if (player.isRespawning || player.spawnAnimation > 0) continue;
      if (entityOverlap(bullet, player)) {
        toRemove.add(bullet.id);
        if (!player.hasShield) {
          this.killPlayer(player.playerIndex);
        } else {
          this.addExplosion(bullet.x, bullet.y, false);
        }
        break;
      }
    }
  }

  /**
   * Check if a bullet collides with an opposing bullet (player vs enemy).
   * @param bullet - The bullet to check
   * @param toRemove - Set of bullet IDs to remove
   */
  private handleBulletVsBullet(bullet: Bullet, toRemove: Set<string>): void {
    for (const other of this.state.bullets) {
      if (other.id === bullet.id) continue;
      if (toRemove.has(other.id)) continue;
      if (bullet.isPlayerBullet !== other.isPlayerBullet && entityOverlap(bullet, other)) {
        toRemove.add(bullet.id);
        toRemove.add(other.id);
        this.addExplosion(bullet.x, bullet.y, false);
        break;
      }
    }
  }

  /**
   * Destroy a brick tile and emit debris particles.
   * @param row - Tile grid row
   * @param col - Tile grid column
   */
  private destroyBrick(row: number, col: number): void {
    this.state.mapData[row][col] = TileType.EMPTY;
    this.addParticles(
      col * C.TILE_SIZE + C.TILE_SIZE / 2,
      row * C.TILE_SIZE + C.TILE_SIZE / 2,
      C.COLORS.brick,
      6,
    );
  }

  // ============ KILLS ============

  /**
   * Handle enemy death: award score, spawn effects, and possibly drop power-up.
   * @param enemy - The enemy that was killed
   * @param killerPlayerIndex - Which player scored the kill
   */
  private killEnemy(enemy: EnemyTank, killerPlayerIndex: PlayerIndex): void {
    const s = this.state;
    const config = C.ENEMY_CONFIG[enemy.enemyType];
    s.scores[killerPlayerIndex] += config.score;

    this.addExplosion(
      enemy.x + enemy.width / 2,
      enemy.y + enemy.height / 2,
      enemy.enemyType === EnemyType.BOSS,
    );

    if (shouldDropPowerUp(enemy.hasPowerUp)) {
      this.spawnPowerUp();
    }

    s.enemies = s.enemies.filter(e => e.id !== enemy.id);
  }

  /** Spawn a random power-up at a safe position on the map. */
  private spawnPowerUp(): void {
    const pos = getRandomPowerUpPosition(
      C.MAP_COLS * C.TILE_SIZE,
      C.MAP_ROWS * C.TILE_SIZE,
    );
    const powerUp: PowerUp = {
      id: uid(),
      x: pos.x,
      y: pos.y,
      width: C.TILE_SIZE,
      height: C.TILE_SIZE,
      type: getRandomPowerUpType(),
      timer: C.POWERUP_LIFETIME,
      flashTimer: 0,
    };
    this.state.powerUps.push(powerUp);
  }

  /**
   * Handle player death: decrement lives, respawn or remove from game.
   * @param playerIndex - Which player died
   */
  private killPlayer(playerIndex: PlayerIndex): void {
    const s = this.state;
    const player = s.players.find(p => p.playerIndex === playerIndex);
    if (!player) return;

    this.addExplosion(
      player.x + player.width / 2,
      player.y + player.height / 2,
      true,
    );

    s.lives[playerIndex]--;
    if (s.lives[playerIndex] <= 0) {
      s.players = s.players.filter(p => p.playerIndex !== playerIndex);
      this.checkAllPlayersDead();
    } else {
      this.respawnPlayer(player);
    }
  }

  /** Check if all players are dead and trigger game over if so. */
  private checkAllPlayersDead(): void {
    const s = this.state;
    if (s.players.length === 0) {
      s.phase = GamePhase.GAME_OVER;
      s.gameOverTimer = C.GAME_OVER_DELAY;
      this.notifyUI();
    }
  }

  /**
   * Reset a player to their spawn point in respawning state.
   * @param player - The player to respawn
   */
  private respawnPlayer(player: PlayerTank): void {
    const spawnPoint = this.getPlayerSpawnPoint(player.playerIndex);
    player.x = spawnPoint.x;
    player.y = spawnPoint.y;
    player.direction = Direction.UP;
    player.isRespawning = true;
    player.respawnTimer = C.RESPAWN_DELAY;
    player.hasShield = false;
    player.firepowerLevel = 0;
    player.speed = C.PLAYER_SPEED;
    player.baseSpeed = C.PLAYER_SPEED;
    player.bulletPower = 1;
    player.bulletSpeed = C.PLAYER_BULLET_SPEED;
    player.speedBoostTimer = 0;
  }

  /**
   * Get the spawn point for a player by index from the current level.
   * @param playerIndex - 0 for P1, 1 for P2
   * @returns The spawn point coordinates
   */
  private getPlayerSpawnPoint(playerIndex: PlayerIndex): Point {
    const level = this.levels[this.state.currentLevel];
    if (!level) return { x: 0, y: 0 };
    return playerIndex === 0 ? level.playerSpawnPoint : level.player2SpawnPoint;
  }

  // ============ POWERUPS ============

  /**
   * Update all power-ups: tick timers and check for player pickups.
   * @param dtMs - Delta time in milliseconds
   */
  private updatePowerUps(dtMs: number): void {
    const s = this.state;

    for (const pu of s.powerUps) {
      pu.timer -= dtMs;
      pu.flashTimer += dtMs;

      for (const player of s.players) {
        if (!player.isRespawning && entityOverlap(player, pu)) {
          this.applyPowerUp(pu.type, player.playerIndex);
          pu.timer = -1;
          break;
        }
      }
    }

    s.powerUps = s.powerUps.filter(p => p.timer > 0);
  }

  /**
   * Apply a power-up effect to a specific player.
   * @param type - The type of power-up to apply
   * @param playerIndex - Which player receives the effect
   */
  private applyPowerUp(type: PowerUpType, playerIndex: PlayerIndex): void {
    const s = this.state;
    const player = s.players.find(p => p.playerIndex === playerIndex);
    if (!player) return;

    switch (type) {
      case PowerUpType.SHIELD:
        player.hasShield = true;
        player.shieldTimer = C.POWERUP_DURATION;
        break;
      case PowerUpType.SPEED:
        player.speed = player.baseSpeed * 1.5;
        player.speedBoostTimer = C.POWERUP_DURATION;
        break;
      case PowerUpType.FIREPOWER:
        player.firepowerLevel = Math.min(player.firepowerLevel + 1, 3);
        if (player.firepowerLevel >= 2) player.bulletSpeed = C.PLAYER_BULLET_SPEED * 1.5;
        if (player.firepowerLevel >= 3) player.bulletPower = 3;
        break;
      case PowerUpType.EXTRA_LIFE:
        s.lives[playerIndex]++;
        break;
      case PowerUpType.BOMB:
        for (const enemy of [...s.enemies]) {
          this.killEnemy(enemy, playerIndex);
        }
        break;
      case PowerUpType.TIME_FREEZE:
        s.freezeTimer = C.POWERUP_DURATION;
        for (const enemy of s.enemies) {
          enemy.frozen = true;
        }
        break;
    }
  }

  // ============ EFFECTS ============

  /**
   * Add an explosion effect at a position.
   * @param x - Center X coordinate
   * @param y - Center Y coordinate
   * @param isBig - Whether this is a large explosion (boss/player death)
   */
  private addExplosion(x: number, y: number, isBig: boolean): void {
    const maxR = isBig ? 30 : 15;
    const dur = isBig ? C.BIG_EXPLOSION_DURATION : C.EXPLOSION_DURATION;
    this.state.explosions.push({
      id: uid(),
      x, y,
      radius: 2,
      maxRadius: maxR,
      timer: dur,
      maxTimer: dur,
      isBig,
    });
    this.addParticles(x, y, isBig ? '#FF4400' : '#FFAA00', isBig ? 12 : 6);
  }

  /**
   * Create debris particles radiating from a point.
   * @param x - Center X coordinate
   * @param y - Center Y coordinate
   * @param color - Particle fill color
   * @param count - Number of particles to spawn
   */
  private addParticles(x: number, y: number, color: string, count: number): void {
    for (let idx = 0; idx < count; idx++) {
      const angle = (Math.PI * 2 * idx) / count + (Math.random() - 0.5) * 0.5;
      const speed = 40 + Math.random() * 80;
      this.state.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 300 + Math.random() * 200,
        maxLife: 500,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  /**
   * Tick explosion and particle timers, remove expired effects.
   * @param dtMs - Delta time in milliseconds
   */
  private updateEffects(dtMs: number): void {
    const s = this.state;
    const dtSec = dtMs / 1000;

    for (const exp of s.explosions) {
      exp.timer -= dtMs;
      const progress = 1 - exp.timer / exp.maxTimer;
      exp.radius = exp.maxRadius * Math.sin(progress * Math.PI);
    }
    s.explosions = s.explosions.filter(e => e.timer > 0);

    for (const p of s.particles) {
      p.x += p.vx * dtSec;
      p.y += p.vy * dtSec;
      p.vy += 100 * dtSec;
      p.life -= dtMs;
    }
    s.particles = s.particles.filter(p => p.life > 0);
  }

  /**
   * Tick spawn effect timers, remove expired effects.
   * @param dtMs - Delta time in milliseconds
   */
  private updateSpawnEffects(dtMs: number): void {
    for (const se of this.state.spawnEffects) {
      se.timer -= dtMs;
    }
    this.state.spawnEffects = this.state.spawnEffects.filter(se => se.timer > 0);
  }

  // ============ WIN/LOSE ============

  /** Check victory and defeat conditions each frame. */
  private checkWinLose(): void {
    const s = this.state;

    if (s.baseDestroyed) {
      s.phase = GamePhase.GAME_OVER;
      s.gameOverTimer = C.GAME_OVER_DELAY;
      this.notifyUI();
      return;
    }

    if (s.enemySpawnQueue.length === 0 && s.enemies.length === 0) {
      s.phase = GamePhase.LEVEL_COMPLETE;
      s.levelCompleteTimer = C.LEVEL_COMPLETE_DELAY;
      this.notifyUI();
    }
  }

  // ============ LEVEL MANAGEMENT ============

  /**
   * Initialize and start a new game with the selected mode.
   * @param mode - 1 for single player, 2 for two-player coop
   */
  startGame(mode: GameMode): void {
    this.state = this.createInitialState();
    this.state.gameMode = mode;
    this.state.currentLevel = 0;
    if (mode === 2) {
      this.state.scores = [0, 0];
      this.state.lives = [C.PLAYER_INITIAL_LIVES, C.PLAYER_INITIAL_LIVES];
    }
    this.loadLevel(0);
  }

  /** Advance to the next level, or loop back to level 1 with a bonus. */
  private nextLevel(): void {
    const s = this.state;
    s.currentLevel++;
    if (s.currentLevel >= this.levels.length) {
      s.currentLevel = 0;
      for (let i = 0; i < s.scores.length; i++) {
        s.scores[i] += 5000;
      }
    }
    this.loadLevel(s.currentLevel);
  }

  /**
   * Load a level: reset map, entities, and create player tank(s).
   * @param index - Level index to load
   */
  private loadLevel(index: number): void {
    const s = this.state;
    const level = this.levels[index];
    if (!level) return;

    s.mapData = level.mapData.map(row => [...row]);
    s.brickHealth = level.mapData.map(row =>
      row.map(tile => (tile === TileType.BRICK ? 0b1111 : 0)),
    );

    s.enemies = [];
    s.bullets = [];
    s.powerUps = [];
    s.explosions = [];
    s.particles = [];
    s.spawnEffects = [];
    s.baseDestroyed = false;
    s.freezeTimer = 0;
    s.enemySpawnQueue = [...level.enemySpawnQueue];
    s.enemySpawnTimer = 1000;

    s.players = [];
    this.createAndAddPlayer(0, level.playerSpawnPoint);
    if (s.gameMode === 2 && s.lives[1] > 0) {
      this.createAndAddPlayer(1, level.player2SpawnPoint);
    }

    s.phase = GamePhase.STAGE_INTRO;
    s.stageIntroTimer = C.STAGE_INTRO_DURATION;
    this.notifyUI();
  }

  /**
   * Create a player tank and add it to the game state.
   * @param playerIndex - 0 for P1, 1 for P2
   * @param spawnPoint - The spawn position
   */
  private createAndAddPlayer(playerIndex: PlayerIndex, spawnPoint: Point): void {
    const player: PlayerTank = {
      id: playerIndex === 0 ? 'player1' : 'player2',
      playerIndex,
      x: spawnPoint.x,
      y: spawnPoint.y,
      width: C.TANK_SIZE,
      height: C.TANK_SIZE,
      direction: Direction.UP,
      speed: C.PLAYER_SPEED,
      health: C.PLAYER_HEALTH,
      maxHealth: C.PLAYER_HEALTH,
      fireRate: C.PLAYER_FIRE_RATE,
      lastFireTime: 0,
      bulletSpeed: C.PLAYER_BULLET_SPEED,
      bulletPower: 1,
      isMoving: false,
      spawnAnimation: C.SPAWN_ANIMATION_DURATION,
      hasShield: true,
      shieldTimer: 3000,
      speedBoostTimer: 0,
      firepowerLevel: 0,
      isRespawning: false,
      respawnTimer: 0,
      baseSpeed: C.PLAYER_SPEED,
    };

    this.state.players.push(player);
  }
}
