import type {
  GameState, PlayerTank, EnemyTank, Bullet, PowerUp, Explosion, Particle,
  SpawnEffect, LevelConfig,
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
function uid(): string { return `e${nextId++}`; }

export type UICallback = (state: {
  phase: GamePhase;
  score: number;
  lives: number;
  currentLevel: number;
  enemiesRemaining: number;
  playerPowerUps: { hasShield: boolean; speedBoost: boolean; firepowerLevel: number };
}) => void;

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

  private createInitialState(): GameState {
    return {
      phase: GamePhase.START_SCREEN,
      currentLevel: 0,
      score: 0,
      lives: C.PLAYER_INITIAL_LIVES,
      player: null,
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
    };
  }

  setUICallback(cb: UICallback) {
    this.uiCallback = cb;
  }

  private notifyUI() {
    if (!this.uiCallback) return;
    const s = this.state;
    this.uiCallback({
      phase: s.phase,
      score: s.score,
      lives: s.lives,
      currentLevel: s.currentLevel,
      enemiesRemaining: s.enemySpawnQueue.length + s.enemies.length,
      playerPowerUps: {
        hasShield: s.player?.hasShield ?? false,
        speedBoost: (s.player?.speedBoostTimer ?? 0) > 0,
        firepowerLevel: s.player?.firepowerLevel ?? 0,
      },
    });
  }

  start() {
    this.input.attach();
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.animFrameId);
    this.input.detach();
  }

  private loop = (time: number) => {
    if (!this.running) return;
    const dt = Math.min(time - this.lastTime, 50); // cap at 50ms
    this.lastTime = time;
    this.input.update();
    this.update(dt);
    this.animFrameId = requestAnimationFrame(this.loop);
  };

  // ============ UPDATE ============

  private update(dt: number) {
    const s = this.state;
    const dtSec = dt / 1000;

    switch (s.phase) {
      case GamePhase.START_SCREEN:
        if (this.input.wasJustPressed('Enter') || this.input.wasJustPressed('Space')) {
          this.startGame();
        }
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
        this.updatePlaying(dtSec, dt);
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

  private updatePlaying(dtSec: number, dtMs: number) {
    const s = this.state;

    // Update freeze timer
    if (s.freezeTimer > 0) {
      s.freezeTimer -= dtMs;
    }

    // Update player
    if (s.player) {
      this.updatePlayer(dtSec, dtMs);
    }

    // Update enemies (if not frozen)
    if (s.freezeTimer <= 0) {
      this.updateEnemies(dtSec, dtMs);
    }

    // Spawn enemies
    this.updateEnemySpawning(dtMs);

    // Update bullets
    this.updateBullets(dtSec);

    // Update powerups
    this.updatePowerUps(dtMs);

    // Update explosions & particles
    this.updateEffects(dtMs);

    // Update spawn effects
    this.updateSpawnEffects(dtMs);

    // Check win/lose
    this.checkWinLose();

    this.notifyUI();
  }

  // ============ PLAYER ============

  private updatePlayer(dtSec: number, dtMs: number) {
    const p = this.state.player!;

    // Handle respawn
    if (p.isRespawning) {
      p.respawnTimer -= dtMs;
      if (p.respawnTimer <= 0) {
        p.isRespawning = false;
        p.hasShield = true;
        p.shieldTimer = 3000;
      }
      return;
    }

    // Shield timer
    if (p.hasShield) {
      p.shieldTimer -= dtMs;
      if (p.shieldTimer <= 0) p.hasShield = false;
    }

    // Speed boost timer
    if (p.speedBoostTimer > 0) {
      p.speedBoostTimer -= dtMs;
      if (p.speedBoostTimer <= 0) {
        p.speed = p.baseSpeed;
      }
    }

    // Spawn animation
    if (p.spawnAnimation > 0) {
      p.spawnAnimation -= dtMs;
      return;
    }

    // Movement
    let newDir: Direction | null = null;
    if (this.input.isDown('ArrowUp') || this.input.isDown('KeyW')) newDir = Direction.UP;
    else if (this.input.isDown('ArrowDown') || this.input.isDown('KeyS')) newDir = Direction.DOWN;
    else if (this.input.isDown('ArrowLeft') || this.input.isDown('KeyA')) newDir = Direction.LEFT;
    else if (this.input.isDown('ArrowRight') || this.input.isDown('KeyD')) newDir = Direction.RIGHT;

    p.isMoving = newDir !== null;

    if (newDir !== null) {
      // Snap perpendicular axis when turning
      if (newDir !== p.direction) {
        if (newDir === Direction.UP || newDir === Direction.DOWN) {
          p.x = snapToGrid(p.x);
        } else {
          p.y = snapToGrid(p.y);
        }
      }
      p.direction = newDir;

      const { dx, dy } = directionDelta(newDir);
      const moveX = dx * p.speed * dtSec;
      const moveY = dy * p.speed * dtSec;

      // Collision check with map and other tanks
      const otherTanks = this.state.enemies.filter(e => !e.frozen || this.state.freezeTimer <= 0);
      if (canMove(p, moveX, moveY, this.state.mapData) &&
          !tanksCollide(p, moveX, moveY, otherTanks)) {
        p.x += moveX;
        p.y += moveY;
      }
    }

    // Ice sliding
    const tiles = getOverlappingTiles(p);
    const _onIce = tiles.some(t => this.state.mapData[t.row]?.[t.col] === TileType.ICE);

    // Shooting
    if (this.input.isDown('Space') || this.input.wasJustPressed('Space')) {
      const now = performance.now();
      const effectiveFireRate = p.firepowerLevel >= 1 ? p.fireRate * 0.6 : p.fireRate;
      if (now - p.lastFireTime >= effectiveFireRate) {
        this.fireBullet(p, true);
        p.lastFireTime = now;
      }
    }
  }

  // ============ ENEMIES ============

  private updateEnemies(dtSec: number, dtMs: number) {
    const s = this.state;

    for (const enemy of s.enemies) {
      if (enemy.frozen && s.freezeTimer > 0) continue;
      enemy.frozen = false;

      // AI direction change
      enemy.aiTimer -= dtMs;
      if (enemy.aiTimer <= 0) {
        enemy.direction = decideDirection(
          enemy,
          s.player && !s.player.isRespawning ? s.player.x : null,
          s.player && !s.player.isRespawning ? s.player.y : null,
        );
        enemy.aiTimer = getAIDirectionInterval(enemy.enemyType);
      }

      // Boss speed multiplier
      let speedMult = 1;
      if (enemy.enemyType === EnemyType.BOSS) {
        const phase = getBossPhase(enemy);
        speedMult = getBossSpeedMultiplier(phase);
      }

      // Move
      const { dx, dy } = directionDelta(enemy.direction);
      const moveX = dx * enemy.speed * speedMult * dtSec;
      const moveY = dy * enemy.speed * speedMult * dtSec;

      const otherTanks = [
        ...s.enemies.filter(e => e.id !== enemy.id),
        ...(s.player && !s.player.isRespawning ? [s.player] : []),
      ];

      if (canMove(enemy, moveX, moveY, s.mapData) &&
          !tanksCollide(enemy, moveX, moveY, otherTanks)) {
        enemy.x += moveX;
        enemy.y += moveY;
        enemy.isMoving = true;
      } else {
        enemy.isMoving = false;
        // Change direction on collision
        enemy.direction = decideDirection(enemy, null, null);
        enemy.aiTimer = getAIDirectionInterval(enemy.enemyType);
      }

      // Shooting
      if (shouldShoot(enemy, dtMs)) {
        let fireRateMult = 1;
        if (enemy.enemyType === EnemyType.BOSS) {
          fireRateMult = getBossFireRateMultiplier(getBossPhase(enemy));
        }
        enemy.aiShootTimer *= fireRateMult;
        this.fireBullet(enemy, false);

        // Boss extra directions
        if (enemy.enemyType === EnemyType.BOSS) {
          const phase = getBossPhase(enemy);
          const extraDirs = getBossExtraDirections(phase, enemy.direction);
          for (const dir of extraDirs) {
            this.fireBulletInDirection(enemy, false, dir);
          }
        }
      }

      // Spawn animation
      if (enemy.spawnAnimation > 0) {
        enemy.spawnAnimation -= dtMs;
      }
    }
  }

  private updateEnemySpawning(dtMs: number) {
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

  private spawnNextEnemy() {
    const s = this.state;
    const level = this.levels[s.currentLevel];
    if (!level || s.enemySpawnQueue.length === 0) return;

    const type = s.enemySpawnQueue.shift()!;
    const spawnPoint = level.enemySpawnPoints[
      Math.floor(Math.random() * level.enemySpawnPoints.length)
    ];

    // Check spawn point is clear
    const spawnBox = {
      x: spawnPoint.x, y: spawnPoint.y,
      width: C.TANK_SIZE, height: C.TANK_SIZE,
    };
    const allTanks = [...s.enemies, ...(s.player ? [s.player] : [])];
    if (tanksCollide({ x: spawnBox.x - 1, y: spawnBox.y - 1, width: spawnBox.width, height: spawnBox.height }, 0, 0, allTanks)) {
      s.enemySpawnQueue.unshift(type);
      s.enemySpawnTimer = 500; // retry sooner
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

    // Spawn effect
    s.spawnEffects.push({
      id: uid(),
      x: spawnPoint.x + C.TANK_SIZE / 2,
      y: spawnPoint.y + C.TANK_SIZE / 2,
      timer: C.SPAWN_ANIMATION_DURATION,
      maxTimer: C.SPAWN_ANIMATION_DURATION,
    });
  }

  // ============ BULLETS ============

  private fireBullet(tank: PlayerTank | EnemyTank, isPlayer: boolean) {
    this.fireBulletInDirection(tank, isPlayer, tank.direction);
  }

  private fireBulletInDirection(
    tank: PlayerTank | EnemyTank,
    isPlayer: boolean,
    direction: Direction,
  ) {
    const s = this.state;

    // Limit bullets on screen per entity
    const existingBullets = s.bullets.filter(b => b.ownerId === tank.id);
    const maxBullets = isPlayer ? (('firepowerLevel' in tank && tank.firepowerLevel >= 2) ? 2 : 1) : 1;
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

  private updateBullets(dtSec: number) {
    const s = this.state;
    const toRemove: Set<string> = new Set();

    for (const bullet of s.bullets) {
      const { dx, dy } = directionDelta(bullet.direction);
      bullet.x += dx * bullet.speed * dtSec;
      bullet.y += dy * bullet.speed * dtSec;

      // Out of bounds
      if (isOutOfBounds(bullet)) {
        toRemove.add(bullet.id);
        continue;
      }

      // Tile collision
      const tileHit = bulletTileCollision(bullet, s.mapData);
      if (tileHit) {
        toRemove.add(bullet.id);
        if (tileHit.tileType === TileType.BRICK) {
          this.destroyBrick(tileHit.row, tileHit.col);
          this.addExplosion(bullet.x, bullet.y, false);
        } else if (tileHit.tileType === TileType.STEEL) {
          // Only power bullets destroy steel
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
        continue;
      }

      // Bullet vs tanks
      if (bullet.isPlayerBullet) {
        // Hit enemies
        for (const enemy of s.enemies) {
          if (enemy.spawnAnimation > 0) continue;
          if (entityOverlap(bullet, enemy)) {
            toRemove.add(bullet.id);
            enemy.health -= bullet.power;
            if (enemy.health <= 0) {
              this.killEnemy(enemy);
            } else {
              this.addExplosion(bullet.x, bullet.y, false);
            }
            break;
          }
        }
      } else {
        // Hit player
        if (s.player && !s.player.isRespawning && s.player.spawnAnimation <= 0) {
          if (entityOverlap(bullet, s.player)) {
            toRemove.add(bullet.id);
            if (!s.player.hasShield) {
              this.killPlayer();
            } else {
              this.addExplosion(bullet.x, bullet.y, false);
            }
          }
        }
      }

      // Bullet vs bullet
      for (const other of s.bullets) {
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

    s.bullets = s.bullets.filter(b => !toRemove.has(b.id));
  }

  private destroyBrick(row: number, col: number) {
    this.state.mapData[row][col] = TileType.EMPTY;
    this.addParticles(
      col * C.TILE_SIZE + C.TILE_SIZE / 2,
      row * C.TILE_SIZE + C.TILE_SIZE / 2,
      C.COLORS.brick,
      6,
    );
  }

  // ============ KILLS ============

  private killEnemy(enemy: EnemyTank) {
    const s = this.state;
    const config = C.ENEMY_CONFIG[enemy.enemyType];
    s.score += config.score;

    this.addExplosion(
      enemy.x + enemy.width / 2,
      enemy.y + enemy.height / 2,
      enemy.enemyType === EnemyType.BOSS,
    );

    // Drop powerup
    if (shouldDropPowerUp(enemy.hasPowerUp)) {
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
      s.powerUps.push(powerUp);
    }

    s.enemies = s.enemies.filter(e => e.id !== enemy.id);
  }

  private killPlayer() {
    const s = this.state;
    if (!s.player) return;

    this.addExplosion(
      s.player.x + s.player.width / 2,
      s.player.y + s.player.height / 2,
      true,
    );

    s.lives--;
    if (s.lives <= 0) {
      s.player = null;
      s.phase = GamePhase.GAME_OVER;
      s.gameOverTimer = C.GAME_OVER_DELAY;
      this.notifyUI();
    } else {
      // Respawn
      const level = this.levels[s.currentLevel];
      s.player.x = level.playerSpawnPoint.x;
      s.player.y = level.playerSpawnPoint.y;
      s.player.direction = Direction.UP;
      s.player.isRespawning = true;
      s.player.respawnTimer = C.RESPAWN_DELAY;
      s.player.hasShield = false;
      s.player.firepowerLevel = 0;
      s.player.speed = C.PLAYER_SPEED;
      s.player.baseSpeed = C.PLAYER_SPEED;
      s.player.bulletPower = 1;
      s.player.bulletSpeed = C.PLAYER_BULLET_SPEED;
      s.player.speedBoostTimer = 0;
    }
  }

  // ============ POWERUPS ============

  private updatePowerUps(dtMs: number) {
    const s = this.state;

    for (const pu of s.powerUps) {
      pu.timer -= dtMs;
      pu.flashTimer += dtMs;

      // Player pickup
      if (s.player && !s.player.isRespawning && entityOverlap(s.player, pu)) {
        this.applyPowerUp(pu.type);
        pu.timer = -1; // mark for removal
      }
    }

    s.powerUps = s.powerUps.filter(p => p.timer > 0);
  }

  private applyPowerUp(type: PowerUpType) {
    const s = this.state;
    const p = s.player;
    if (!p) return;

    switch (type) {
      case PowerUpType.SHIELD:
        p.hasShield = true;
        p.shieldTimer = C.POWERUP_DURATION;
        break;
      case PowerUpType.SPEED:
        p.speed = p.baseSpeed * 1.5;
        p.speedBoostTimer = C.POWERUP_DURATION;
        break;
      case PowerUpType.FIREPOWER:
        p.firepowerLevel = Math.min(p.firepowerLevel + 1, 3);
        if (p.firepowerLevel >= 2) p.bulletSpeed = C.PLAYER_BULLET_SPEED * 1.5;
        if (p.firepowerLevel >= 3) p.bulletPower = 3; // can destroy steel
        break;
      case PowerUpType.EXTRA_LIFE:
        s.lives++;
        break;
      case PowerUpType.BOMB:
        // Kill all enemies on screen
        for (const enemy of [...s.enemies]) {
          this.killEnemy(enemy);
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

  private addExplosion(x: number, y: number, big: boolean) {
    const maxR = big ? 30 : 15;
    const dur = big ? C.BIG_EXPLOSION_DURATION : C.EXPLOSION_DURATION;
    this.state.explosions.push({
      id: uid(),
      x, y,
      radius: 2,
      maxRadius: maxR,
      timer: dur,
      maxTimer: dur,
      isBig: big,
    });
    this.addParticles(x, y, big ? '#FF4400' : '#FFAA00', big ? 12 : 6);
  }

  private addParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
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

  private updateEffects(dtMs: number) {
    const s = this.state;
    const dtSec = dtMs / 1000;

    // Explosions
    for (const exp of s.explosions) {
      exp.timer -= dtMs;
      const progress = 1 - exp.timer / exp.maxTimer;
      exp.radius = exp.maxRadius * Math.sin(progress * Math.PI);
    }
    s.explosions = s.explosions.filter(e => e.timer > 0);

    // Particles
    for (const p of s.particles) {
      p.x += p.vx * dtSec;
      p.y += p.vy * dtSec;
      p.vy += 100 * dtSec; // gravity
      p.life -= dtMs;
    }
    s.particles = s.particles.filter(p => p.life > 0);
  }

  private updateSpawnEffects(dtMs: number) {
    for (const se of this.state.spawnEffects) {
      se.timer -= dtMs;
    }
    this.state.spawnEffects = this.state.spawnEffects.filter(se => se.timer > 0);
  }

  // ============ WIN/LOSE ============

  private checkWinLose() {
    const s = this.state;

    // Base destroyed
    if (s.baseDestroyed) {
      s.phase = GamePhase.GAME_OVER;
      s.gameOverTimer = C.GAME_OVER_DELAY;
      this.notifyUI();
      return;
    }

    // All enemies defeated
    if (s.enemySpawnQueue.length === 0 && s.enemies.length === 0) {
      s.phase = GamePhase.LEVEL_COMPLETE;
      s.levelCompleteTimer = C.LEVEL_COMPLETE_DELAY;
      this.notifyUI();
    }
  }

  // ============ LEVEL MANAGEMENT ============

  startGame() {
    this.state = this.createInitialState();
    this.state.currentLevel = 0;
    this.loadLevel(0);
  }

  private nextLevel() {
    const s = this.state;
    s.currentLevel++;
    if (s.currentLevel >= this.levels.length) {
      // Won the game! restart
      s.currentLevel = 0;
      s.score += 5000; // bonus
    }
    this.loadLevel(s.currentLevel);
  }

  private loadLevel(index: number) {
    const s = this.state;
    const level = this.levels[index];
    if (!level) return;

    // Deep copy map
    s.mapData = level.mapData.map(row => [...row]);
    s.brickHealth = level.mapData.map(row =>
      row.map(tile => (tile === TileType.BRICK ? 0b1111 : 0)),
    );

    // Reset entities
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

    // Create player
    s.player = {
      id: 'player',
      x: level.playerSpawnPoint.x,
      y: level.playerSpawnPoint.y,
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

    // Stage intro
    s.phase = GamePhase.STAGE_INTRO;
    s.stageIntroTimer = C.STAGE_INTRO_DURATION;
    this.notifyUI();
  }
}
