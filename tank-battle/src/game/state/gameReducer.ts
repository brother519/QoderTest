import { GameState, GameAction, Tank, Bullet, TileType, Direction, Position } from '../types';
import { LevelManager } from '../levels/LevelManager';
import { PLAYER_START_LIVES, TANK_SPEED, SHOOT_COOLDOWN, BULLET_SPEED, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { AISystem } from '../systems/AISystem';
import { SpawnSystem } from '../systems/SpawnSystem';

export const initialState: GameState = {
  status: 'menu',
  score: 0,
  lives: PLAYER_START_LIVES,
  level: 1,
  map: [],
  player: null,
  enemies: [],
  bullets: [],
  base: { position: { x: 12, y: 23 }, isDestroyed: false },
  spawnQueue: 0,
};

function createPlayer(position: Position): Tank {
  return {
    id: 'player',
    type: 'player',
    position,
    direction: 'up',
    speed: TANK_SPEED,
    isAlive: true,
    isSpawning: true,
    spawnTimer: 60,
    shootCooldown: 0,
    health: 1,
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

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT_LEVEL': {
      const { level, map, enemyCount } = action.payload;
      const playerPos = LevelManager.getPlayerStartPosition();
      const basePos = LevelManager.findBasePosition(map) || { x: 12, y: 23 };

      SpawnSystem.reset();

      return {
        ...state,
        level,
        map: LevelManager.copyMap(map),
        player: createPlayer(playerPos),
        enemies: [],
        bullets: [],
        base: { position: basePos, isDestroyed: false },
        spawnQueue: enemyCount,
        status: 'playing',
      };
    }

    case 'START_GAME': {
      const levelConfig = LevelManager.getLevel(1);
      if (!levelConfig) return state;

      const playerPos = LevelManager.getPlayerStartPosition();
      const basePos = LevelManager.findBasePosition(levelConfig.map) || { x: 12, y: 23 };

      SpawnSystem.reset();

      return {
        ...state,
        status: 'playing',
        score: 0,
        lives: PLAYER_START_LIVES,
        level: 1,
        map: LevelManager.copyMap(levelConfig.map),
        player: createPlayer(playerPos),
        enemies: [],
        bullets: [],
        base: { position: basePos, isDestroyed: false },
        spawnQueue: levelConfig.enemyCount,
      };
    }

    case 'GAME_TICK': {
      if (state.status !== 'playing') return state;

      let newState = { ...state };
      const input = action.payload.input;

      if (newState.player && newState.player.isAlive) {
        let player = { ...newState.player };

        if (player.spawnTimer > 0) {
          player.spawnTimer--;
          if (player.spawnTimer === 0) {
            player.isSpawning = false;
          }
        }

        if (player.shootCooldown > 0) {
          player.shootCooldown--;
        }

        let newDirection: Direction | null = null;
        if (input.up) newDirection = 'up';
        else if (input.down) newDirection = 'down';
        else if (input.left) newDirection = 'left';
        else if (input.right) newDirection = 'right';

        if (newDirection) {
          player.direction = newDirection;
          const newPos = PhysicsSystem.moveTank(player, newDirection, newState.map);
          if (newPos) {
            player.position = newPos;
          }
        }

        if (input.shoot && player.shootCooldown === 0) {
          const bulletPos = { ...player.position };
          switch (player.direction) {
            case 'up': bulletPos.y -= 20; bulletPos.x += 16; break;
            case 'down': bulletPos.y += 52; bulletPos.x += 16; break;
            case 'left': bulletPos.x -= 20; bulletPos.y += 16; break;
            case 'right': bulletPos.x += 52; bulletPos.y += 16; break;
          }
          newState.bullets = [...newState.bullets, createBullet('player', bulletPos, player.direction)];
          player.shootCooldown = SHOOT_COOLDOWN;
        }

        newState.player = player;
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

        const aiDecision = AISystem.updateEnemy(updatedEnemy, newState.player?.position || null);

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
      let playerHit = false;
      let baseHit = false;

      newState.bullets.forEach(bullet => {
        const mapCollision = CollisionSystem.checkBulletMapCollision(bullet.position, newState.map);
        if (mapCollision.hit) {
          bulletsToRemove.add(bullet.id);
          if (mapCollision.gridPos) {
            const tile = newState.map[mapCollision.gridPos.y][mapCollision.gridPos.x];
            if (tile === TileType.BRICK) {
              newState.map[mapCollision.gridPos.y][mapCollision.gridPos.x] = TileType.EMPTY;
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
              }
            }
          });
        } else if (bullet.owner === 'enemy') {
          if (newState.player && !newState.player.isSpawning && CollisionSystem.checkBulletTankCollision(bullet.position, newState.player)) {
            bulletsToRemove.add(bullet.id);
            playerHit = true;
          }
        }
      });

      newState.bullets = newState.bullets.filter(b => !bulletsToRemove.has(b.id));
      newState.enemies = newState.enemies.filter(e => !enemiesToRemove.has(e.id));

      enemiesToRemove.forEach(id => AISystem.cleanup(id));

      if (baseHit) {
        newState.base.isDestroyed = true;
        newState.status = 'gameOver';
      }

      if (playerHit) {
        newState.lives--;
        if (newState.lives <= 0) {
          newState.status = 'gameOver';
        } else {
          const playerPos = LevelManager.getPlayerStartPosition();
          newState.player = createPlayer(playerPos);
        }
      }

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
        } else {
          newState.status = 'gameOver';
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
      const basePos = LevelManager.findBasePosition(levelConfig.map) || { x: 12, y: 23 };

      SpawnSystem.reset();

      return {
        ...state,
        level: nextLevel,
        map: LevelManager.copyMap(levelConfig.map),
        player: createPlayer(playerPos),
        enemies: [],
        bullets: [],
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
