// === Enums ===

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum TileType {
  EMPTY = 0,
  BRICK = 1,
  STEEL = 2,
  WATER = 3,
  TREES = 4,
  ICE = 5,
  BASE = 6,
}

export enum GamePhase {
  START_SCREEN = 'START_SCREEN',
  STAGE_INTRO = 'STAGE_INTRO',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER',
}

export enum EnemyType {
  BASIC = 'BASIC',
  FAST = 'FAST',
  HEAVY = 'HEAVY',
  ARTILLERY = 'ARTILLERY',
  BOSS = 'BOSS',
}

export enum PowerUpType {
  SHIELD = 'SHIELD',
  SPEED = 'SPEED',
  FIREPOWER = 'FIREPOWER',
  EXTRA_LIFE = 'EXTRA_LIFE',
  BOMB = 'BOMB',
  TIME_FREEZE = 'TIME_FREEZE',
}

// === Interfaces ===

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Tank extends Entity {
  direction: Direction;
  speed: number;
  health: number;
  maxHealth: number;
  fireRate: number; // ms between shots
  lastFireTime: number;
  bulletSpeed: number;
  bulletPower: number;
  isMoving: boolean;
  spawnAnimation: number; // frames remaining for spawn flash
}

export interface PlayerTank extends Tank {
  hasShield: boolean;
  shieldTimer: number;
  speedBoostTimer: number;
  firepowerLevel: number; // 0=normal, 1=fast, 2=double, 3=power
  isRespawning: boolean;
  respawnTimer: number;
  baseSpeed: number;
}

export interface EnemyTank extends Tank {
  enemyType: EnemyType;
  aiTimer: number; // time until next direction change
  aiShootTimer: number;
  hasPowerUp: boolean; // flashing enemy that drops powerup
  frozen: boolean;
  frozenTimer: number;
}

export interface Bullet extends Entity {
  direction: Direction;
  speed: number;
  power: number; // damage dealt
  ownerId: string;
  isPlayerBullet: boolean;
}

export interface PowerUp extends Entity {
  type: PowerUpType;
  timer: number; // time before disappearing
  flashTimer: number;
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  timer: number;
  maxTimer: number;
  isBig: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface SpawnEffect {
  id: string;
  x: number;
  y: number;
  timer: number;
  maxTimer: number;
}

// === Level Config ===

export interface LevelConfig {
  id: number;
  name: string;
  mapData: number[][]; // 26x26 grid
  enemySpawnQueue: EnemyType[];
  maxEnemiesOnField: number;
  hasBoss: boolean;
  bossType?: EnemyType;
  enemySpawnPoints: Point[];
  playerSpawnPoint: Point;
}

// === Game State (engine-side, not React) ===

export interface GameState {
  phase: GamePhase;
  currentLevel: number;
  score: number;
  lives: number;
  player: PlayerTank | null;
  enemies: EnemyTank[];
  bullets: Bullet[];
  powerUps: PowerUp[];
  explosions: Explosion[];
  particles: Particle[];
  spawnEffects: SpawnEffect[];
  mapData: number[][];
  brickHealth: number[][]; // 4 bits per brick tile (quadrant health)
  baseDestroyed: boolean;
  enemySpawnQueue: EnemyType[];
  enemySpawnTimer: number;
  enemiesOnField: number;
  freezeTimer: number; // global freeze from powerup
  stageIntroTimer: number;
  levelCompleteTimer: number;
  gameOverTimer: number;
}
