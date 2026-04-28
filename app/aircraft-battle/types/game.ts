/**
 * 飞机大战游戏类型定义
 *
 * @module app/aircraft-battle/types/game
 */

/** 游戏状态 */
export type AircraftGameStatus = 'idle' | 'playing' | 'paused' | 'over';

/** 敌机类型 */
export type EnemyType = 'small' | 'medium' | 'large' | 'boss';

/** 玩家子弹类型（升级系统） */
export type BulletType = 'normal' | 'spread' | 'laser';

/** 道具类型 */
export type PowerUpType = 'life' | 'fireRate' | 'spread' | 'bomb';

/** 玩家飞机 */
export interface Aircraft {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  lives: number;
  fireRate: number;
  bulletType: BulletType;
  fireCooldown: number;
  invincible: boolean;
  invincibleTimer: number;
}

/** 敌机 */
export interface Enemy {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  hp: number;
  maxHp: number;
  type: EnemyType;
  shootTimer: number;
  shootInterval: number;
  points: number;
  movePattern?: 'straight' | 'sine' | 'cruise';
  movePhase?: number;
}

/** 子弹 */
export interface Bullet {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  dx: number;
  dy: number;
  isPlayerBullet: boolean;
  damage: number;
}

/** 道具 */
export interface PowerUp {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: PowerUpType;
}

/** 爆炸效果 */
export interface Explosion {
  id: number;
  x: number;
  y: number;
  radius: number;
  frame: number;
  maxFrames: number;
}

/** 背景星星 */
export interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
  brightness: number;
}

/** 游戏配置 */
export interface AircraftGameConfig {
  width: number;
  height: number;
  playerSpeed: number;
  initialLives: number;
  baseFireRate: number;
  invincibleDuration: number;
  playerBulletSpeed: number;
  enemyBulletSpeed: number;
  playerBulletSize: { w: number; h: number };
  enemyBulletSize: { w: number; h: number };
  baseSpawnInterval: number;
  powerUpDropRate: number;
  difficultyStep: number;
  difficultyScoreThreshold: number;
  bossScoreThreshold: number;
  enemyTypes: Record<
    EnemyType,
    {
      width: number;
      height: number;
      speedMin: number;
      speedMax: number;
      hp: number;
      points: number;
      shootInterval: number;
      spawnWeight: number;
    }
  >;
}

/** 完整游戏状态 */
export interface AircraftGameState {
  status: AircraftGameStatus;
  player: Aircraft;
  enemies: Enemy[];
  bullets: Bullet[];
  powerUps: PowerUp[];
  explosions: Explosion[];
  stars: Star[];
  score: number;
  difficultyLevel: number;
  speedMultiplier: number;
  spawnInterval: number;
  lastSpawnTime: number;
  lastBossSpawnScore: number;
}
