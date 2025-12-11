import type { GameState, GameAction, Tank, Bullet, Direction, Position } from '../types';
import { TileType } from '../types';
import { LevelManager } from '../levels/LevelManager';
import { PLAYER_START_LIVES, TANK_SPEED, SHOOT_COOLDOWN, RAPID_FIRE_COOLDOWN, BULLET_SPEED, CANVAS_WIDTH, CANVAS_HEIGHT, EXPLOSION_FRAMES } from '../constants';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { AISystem } from '../systems/AISystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { PowerUpSystem } from '../systems/PowerUpSystem';
import { SoundSystem } from '../systems/SoundSystem';

export const initialState: GameState = {
  status: 'menu',
  score: 0,
  lives: PLAYER_START_LIVES,
  level: 1,
  map: [],
  player: null,
  player2: null,
  enemies: [],
  bullets: [],
  base: { position: { x: 12, y: 23 }, isDestroyed: false },
  spawnQueue: 0,
  explosions: [],
  powerUps: [],
  twoPlayerMode: false,
  player2Lives: PLAYER_START_LIVES,
};

function createPlayer(position: Position, playerNumber: 1 | 2 = 1): Tank {
  return {
    id: playerNumber === 1 ? 'player' : 'player2',
    type: 'player',
    playerNumber,
    position,
    direction: 'up',
    speed: TANK_SPEED,
    isAlive: true,
    isSpawning: true,
    spawnTimer: 60,
    shootCooldown: 0,
    health: 1,
    hasShield: false,
    shieldTimer: 0,
    rapidFire: false,
    rapidFireTimer: 0,
  };
}

function createBullet(owner: 'player' | 'enemy', position: Position, direction: Direction): Bullet {
  return {
    id: `bullet_${Date.now()}_${Math.random()}`,
    position: { ...position },
    direction,
    speed: BULLET_SPEED,
    owner,
  };
}

function handlePlayerMovement(player: Tank, input: any, map: any): Tank {
  let updatedPlayer = { ...player };

  if (updatedPlayer.spawnTimer > 0) {
    updatedPlayer.spawnTimer--;
    if (updatedPlayer.spawnTimer === 0) {
      updatedPlayer.isSpawning = false;
    }
  }

  updatedPlayer = PowerUpSystem.updatePowerUpTimers(updatedPlayer);

  if (updatedPlayer.shootCooldown > 0) {
    updatedPlayer.shootCooldown--;
  }

  let newDirection: Direction | null = null;
  if (input.up) newDirection = 'up';
  else if (input.down) newDirection = 'down';
  else if (input.left) newDirection = 'left';
  else if (input.right) newDirection = 'right';

  if (newDirection) {
    updatedPlayer.direction = newDirection;
    const newPos = PhysicsSystem.moveTank(updatedPlayer, newDirection, map);
    if (newPos) {
      updatedPlayer.position = newPos;
    }
  }

  return updatedPlayer;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT_LEVEL': {
      const { level, map, enemyCount } = action.payload;
      const playerPos = LevelManager.getPlayerStartPosition();
      const player2Pos = { x: playerPos.x - 48, y: playerPos.y };
      const basePos = LevelManager.findBasePosition(map) || { x: 12, y: 23 };

      SpawnSystem.reset();
      PowerUpSystem.reset();

      return {
        ...state,
        level,
        map: LevelManager.copyMap(map),
        player: createPlayer(playerPos, 1),
        player2: state.twoPlayerMode ? createPlayer(player2Pos, 2) : null,
        enemies: [],
        bullets: [],
        explosions: [],
        powerUps: [],
        base: { position: basePos, isDestroyed: false },
        spawnQueue: enemyCount,
        status: 'playing',
      };
    }

    case 'START_GAME': {
      const twoPlayer = action.payload?.twoPlayer || false;
      const levelConfig = LevelManager.getLevel(1);
      if (!levelConfig) return state;

      const playerPos = LevelManager.getPlayerStartPosition();
      const player2Pos = { x: playerPos.x - 48, y: playerPos.y };
      const basePos = LevelManager.findBasePosition(levelConfig.map) || { x: 12, y: 23 };

      SpawnSystem.reset();
      PowerUpSystem.reset();
      SoundSystem.init();

      return {
        ...state,
        status: 'playing',
        score: 0,
        lives: PLAYER_START_LIVES,
        player2Lives: PLAYER_START_LIVES,
        level: 1,
        map: LevelManager.copyMap(levelConfig.map),
        player: createPlayer(playerPos, 1),
        player2: twoPlayer ? createPlayer(player2Pos, 2) : null,
        enemies: [],
        bullets: [],
        explosions: [],
        powerUps: [],
        base: { position: basePos, isDestroyed: false },
        spawnQueue: levelConfig.enemyCount,
        twoPlayerMode: twoPlayer,
      };
    }

    case 'GAME_TICK': {
      if (state.status !== 'playing') return state;

      let newState = { ...state };
      const input = action.payload.input;
      const input2 = action.payload.input2;

      if (newState.player && newState.player.isAlive) {
        let player = handlePlayerMovement(newState.player, input, newState.map);

        if (input.shoot && player.shootCooldown === 0) {
          const bulletPos = { ...player.position };
          switch (player.direction) {
            case 'up': bulletPos.y -= 20; bulletPos.x += 16; break;
            case 'down': bulletPos.y += 52; bulletPos.x += 16; break;
            case 'left': bulletPos.x -= 20; bulletPos.y += 16; break;
            case 'right': bulletPos.x += 52; bulletPos.y += 16; break;
          }
          newState.bullets = [...newState.bullets, createBullet('player', bulletPos, player.direction)];
          player.shootCooldown = player.rapidFire ? RAPID_FIRE_COOLDOWN : SHOOT_COOLDOWN;
          SoundSystem.playShoot();
        }

        newState.player = player;
      }

      if (newState.player2 && newState.player2.isAlive && input2) {
        let player2 = handlePlayerMovement(newState.player2, input2, newState.map);

        if (input2.shoot && player2.shootCooldown === 0) {
          const bulletPos = { ...player2.position };
          switch (player2.direction) {
            case 'up': bulletPos.y -= 20; bulletPos.x += 16; break;
            case 'down': bulletPos.y += 52; bulletPos.x += 16; break;
            case 'left': bulletPos.x -= 20; bulletPos.y += 16; break;
            case 'right': bulletPos.x += 52; bulletPos.y += 16; break;
          }
          newState.bullets = [...newState.bullets, createBullet('player', bulletPos, player2.direction)];
          player2.shootCooldown = player2.rapidFire ? RAPID_FIRE_COOLDOWN : SHOOT_COOLDOWN;
          SoundSystem.playShoot();
        }

        newState.player2 = player2;
      }

      newState.enemies = newState.enemies.map(enemy => {
        let updatedEnemy = { ...enemy };

        if (updatedEnemy.spawnTimer > 0) {
          updatedEnemy.spawnTimer--;
          if (updatedEnemy.spawnTimer === 0) {
            updatedEnemy.isSpawning = false;
          }
        }

        if (updatedEnemy.shootCooldown > 0) {
          updatedEnemy.shootCooldown--;
        }

        const targetPlayer = newState.player?.isAlive ? newState.player : (newState.player2?.isAlive ? newState.player2 : null);
        const aiDecision = AISystem.updateEnemy(updatedEnemy, targetPlayer?.position || null, newState.map);

        if (aiDecision.newDirection) {
          updatedEnemy.direction = aiDecision.newDirection;
        }

        const newPos = PhysicsSystem.moveTank(updatedEnemy, updatedEnemy.direction, newState.map);
        if (newPos) {
          updatedEnemy.position = newPos;
        } else {
          updatedEnemy.direction = AISystem.handleCollision(updatedEnemy);
        }

        if (aiDecision.shouldShoot && updatedEnemy.shootCooldown === 0) {
          const bulletPos = { ...updatedEnemy.position };
          switch (updatedEnemy.direction) {
            case 'up': bulletPos.y -= 20; bulletPos.x += 16; break;
            case 'down': bulletPos.y += 52; bulletPos.x += 16; break;
            case 'left': bulletPos.x -= 20; bulletPos.y += 16; break;
            case 'right': bulletPos.x += 52; bulletPos.y += 16; break;
          }
          newState.bullets = [...newState.bullets, createBullet('enemy', bulletPos, updatedEnemy.direction)];
          updatedEnemy.shootCooldown = SHOOT_COOLDOWN;
          SoundSystem.playShoot();
        }

        return updatedEnemy;
      });

      newState.bullets = newState.bullets
        .map(bullet => ({
          ...bullet,
          position: PhysicsSystem.moveBullet(bullet.position, bullet.direction, bullet.speed),
        }))
        .filter(bullet => !PhysicsSystem.isOutOfBounds(bullet.position, CANVAS_WIDTH, CANVAS_HEIGHT));

      const bulletsToRemove = new Set<string>();
      const enemiesToRemove = new Set<string>();
      let player1Hit = false;
      let player2Hit = false;
      let baseHit = false;

      newState.bullets.forEach(bullet => {
        const mapCollision = CollisionSystem.checkBulletMapCollision(bullet.position, newState.map);
        if (mapCollision.hit) {
          bulletsToRemove.add(bullet.id);
          if (mapCollision.gridPos) {
            const tile = newState.map[mapCollision.gridPos.y][mapCollision.gridPos.x];
            if (tile === TileType.BRICK) {
              newState.map[mapCollision.gridPos.y][mapCollision.gridPos.x] = TileType.EMPTY;
              SoundSystem.playHit();
            } else if (tile === TileType.BASE) {
              baseHit = true;
            }
          }
          return;
        }

        if (bullet.owner === 'player') {
          newState.enemies.forEach(enemy => {
            if (!enemy.isSpawning && CollisionSystem.checkBulletTankCollision(bullet.position, enemy)) {
              bulletsToRemove.add(bullet.id);
              enemy.health--;
              if (enemy.health <= 0) {
                enemiesToRemove.add(enemy.id);
                newState.score += 100;
                newState.explosions.push({
                  id: `explosion_${Date.now()}_${Math.random()}`,
                  position: { x: enemy.position.x + 16, y: enemy.position.y + 16 },
                  frame: 0,
                  maxFrames: EXPLOSION_FRAMES,
                });
                SoundSystem.playExplosion();
              } else {
                SoundSystem.playHit();
              }
            }
          });
        } else if (bullet.owner === 'enemy') {
          if (newState.player && !newState.player.isSpawning && CollisionSystem.checkBulletTankCollision(bullet.position, newState.player)) {
            bulletsToRemove.add(bullet.id);
            if (!newState.player.hasShield) {
              player1Hit = true;
            } else {
              SoundSystem.playHit();
            }
          }
          if (newState.player2 && !newState.player2.isSpawning && CollisionSystem.checkBulletTankCollision(bullet.position, newState.player2)) {
            bulletsToRemove.add(bullet.id);
            if (!newState.player2.hasShield) {
              player2Hit = true;
            } else {
              SoundSystem.playHit();
            }
          }
        }
      });

      newState.bullets = newState.bullets.filter(b => !bulletsToRemove.has(b.id));
      newState.enemies = newState.enemies.filter(e => !enemiesToRemove.has(e.id));

      enemiesToRemove.forEach(id => AISystem.cleanup(id));

      if (baseHit) {
        newState.base.isDestroyed = true;
        newState.status = 'gameOver';
        SoundSystem.playGameOver();
      }

      if (player1Hit) {
        newState.lives--;
        newState.explosions.push({
          id: `explosion_${Date.now()}_${Math.random()}`,
          position: { x: newState.player!.position.x + 16, y: newState.player!.position.y + 16 },
          frame: 0,
          maxFrames: EXPLOSION_FRAMES,
        });
        SoundSystem.playExplosion();
        
        if (newState.lives <= 0) {
          newState.player!.isAlive = false;
          if (!newState.player2 || !newState.player2.isAlive) {
            newState.status = 'gameOver';
            SoundSystem.playGameOver();
          }
        } else {
          const playerPos = LevelManager.getPlayerStartPosition();
          newState.player = createPlayer(playerPos, 1);
        }
      }

      if (player2Hit) {
        newState.player2Lives--;
        newState.explosions.push({
          id: `explosion_${Date.now()}_${Math.random()}`,
          position: { x: newState.player2!.position.x + 16, y: newState.player2!.position.y + 16 },
          frame: 0,
          maxFrames: EXPLOSION_FRAMES,
        });
        SoundSystem.playExplosion();
        
        if (newState.player2Lives <= 0) {
          newState.player2!.isAlive = false;
          if (!newState.player || !newState.player.isAlive) {
            newState.status = 'gameOver';
            SoundSystem.playGameOver();
          }
        } else {
          const player2Pos = { x: LevelManager.getPlayerStartPosition().x - 48, y: LevelManager.getPlayerStartPosition().y };
          newState.player2 = createPlayer(player2Pos, 2);
        }
      }

      newState.explosions = newState.explosions
        .map(exp => ({ ...exp, frame: exp.frame + 1 }))
        .filter(exp => exp.frame < exp.maxFrames);

      const spawnedPowerUp = PowerUpSystem.trySpawnPowerUp(newState.enemies, newState.powerUps);
      if (spawnedPowerUp) {
        newState.powerUps = [...newState.powerUps, spawnedPowerUp];
      }

      newState.powerUps = PowerUpSystem.checkExpiredPowerUps(newState.powerUps);

      newState.powerUps = newState.powerUps.filter(powerUp => {
        if (newState.player && PowerUpSystem.checkPowerUpCollection(powerUp, newState.player)) {
          newState.player = PowerUpSystem.applyPowerUp(newState.player, powerUp.type);
          if (powerUp.type === 'extraLife') {
            newState.lives++;
          }
          SoundSystem.playPowerUp();
          return false;
        }
        if (newState.player2 && PowerUpSystem.checkPowerUpCollection(powerUp, newState.player2)) {
          newState.player2 = PowerUpSystem.applyPowerUp(newState.player2, powerUp.type);
          if (powerUp.type === 'extraLife') {
            newState.player2Lives++;
          }
          SoundSystem.playPowerUp();
          return false;
        }
        return true;
      });

      const spawnedEnemy = SpawnSystem.trySpawn(newState.enemies, newState.spawnQueue);
      if (spawnedEnemy) {
        newState.enemies = [...newState.enemies, spawnedEnemy];
        newState.spawnQueue--;
      }

      if (newState.spawnQueue === 0 && newState.enemies.length === 0 && newState.status === 'playing') {
        const nextLevel = newState.level + 1;
        const levelConfig = LevelManager.getLevel(nextLevel);
        if (levelConfig) {
          newState.status = 'levelTransition';
          SoundSystem.playLevelComplete();
        } else {
          newState.status = 'gameOver';
          SoundSystem.playGameOver();
        }
      }

      return newState;
    }

    case 'NEXT_LEVEL': {
      const nextLevel = state.level + 1;
      const levelConfig = LevelManager.getLevel(nextLevel);
      if (!levelConfig) {
        return { ...state, status: 'gameOver' };
      }

      const playerPos = LevelManager.getPlayerStartPosition();
      const player2Pos = { x: playerPos.x - 48, y: playerPos.y };
      const basePos = LevelManager.findBasePosition(levelConfig.map) || { x: 12, y: 23 };

      SpawnSystem.reset();
      PowerUpSystem.reset();

      return {
        ...state,
        level: nextLevel,
        map: LevelManager.copyMap(levelConfig.map),
        player: createPlayer(playerPos, 1),
        player2: state.twoPlayerMode ? createPlayer(player2Pos, 2) : null,
        enemies: [],
        bullets: [],
        explosions: [],
        powerUps: [],
        base: { position: basePos, isDestroyed: false },
        spawnQueue: levelConfig.enemyCount,
        status: 'playing',
      };
    }

    case 'PAUSE':
      return { ...state, status: state.status === 'playing' ? 'paused' : state.status };

    case 'RESUME':
      return { ...state, status: state.status === 'paused' ? 'playing' : state.status };

    case 'GAME_OVER':
      return { ...state, status: 'gameOver' };

    default:
      return state;
  }
}
