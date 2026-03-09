// === Enums ===

/** Direction of tank movement or bullet travel. */
export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

/** Tile types for the 26x26 game map grid. */
export enum TileType {
  EMPTY = 0,
  BRICK = 1,
  STEEL = 2,
  WATER = 3,
  TREES = 4,
  ICE = 5,
  BASE = 6,
}

/** Phases of the game lifecycle. */
export enum GamePhase {
  START_SCREEN = 'START_SCREEN',
  STAGE_INTRO = 'STAGE_INTRO',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER',
}

/** Enemy tank type, each with distinct stats. */
export enum EnemyType {
  BASIC = 'BASIC',
  FAST = 'FAST',
  HEAVY = 'HEAVY',
  ARTILLERY = 'ARTILLERY',
  BOSS = 'BOSS',
}

/** Power-up collectible types. */
export enum PowerUpType {
  SHIELD = 'SHIELD',
  SPEED = 'SPEED',
  FIREPOWER = 'FIREPOWER',
  EXTRA_LIFE = 'EXTRA_LIFE',
  BOMB = 'BOMB',
  TIME_FREEZE = 'TIME_FREEZE',
}

// === Types ===

/** Player index: 0 for Player 1, 1 for Player 2. */
export type PlayerIndex = 0 | 1;

/** Game mode: 1 for single player, 2 for cooperative two-player. */
export type GameMode = 1 | 2;

// === Interfaces ===

/** 2D coordinate point in pixel space. */
export interface Point {
  x: number;
  y: number;
}

/** Width and height dimensions. */
export interface Size {
  width: number;
  height: number;
}

/** Base entity with position, size, and unique identifier. */
export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Base tank entity with movement, combat, and animation properties. */
export interface Tank extends Entity {
  direction: Direction;
  speed: number;
  health: number;
  maxHealth: number;
  /** Milliseconds between shots. */
  fireRate: number;
  lastFireTime: number;
  bulletSpeed: number;
  bulletPower: number;
  isMoving: boolean;
  /** Milliseconds remaining for spawn flash animation. */
  spawnAnimation: number;
}

/** Player-controlled tank with shield, boosts, respawn, and player index. */
export interface PlayerTank extends Tank {
  /** Which player controls this tank: 0 = P1, 1 = P2. */
  playerIndex: PlayerIndex;
  hasShield: boolean;
  shieldTimer: number;
  speedBoostTimer: number;
  /** Firepower level: 0=normal, 1=fast, 2=double, 3=power. */
  firepowerLevel: number;
  isRespawning: boolean;
  respawnTimer: number;
  baseSpeed: number;
}

/** AI-controlled enemy tank with behavior timers and status flags. */
export interface EnemyTank extends Tank {
  enemyType: EnemyType;
  /** Milliseconds until next AI direction change. */
  aiTimer: number;
  aiShootTimer: number;
  /** Whether this enemy flashes and drops a power-up on death. */
  hasPowerUp: boolean;
  frozen: boolean;
  frozenTimer: number;
}

/** Projectile fired by a tank. */
export interface Bullet extends Entity {
  direction: Direction;
  speed: number;
  /** Damage dealt on hit. */
  power: number;
  ownerId: string;
  isPlayerBullet: boolean;
}

/** Collectible power-up item on the map. */
export interface PowerUp extends Entity {
  type: PowerUpType;
  /** Milliseconds before disappearing. */
  timer: number;
  flashTimer: number;
}

/** Expanding circle explosion visual effect. */
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

/** Physics-driven debris particle effect. */
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

/** Flashing star effect shown at tank spawn locations. */
export interface SpawnEffect {
  id: string;
  x: number;
  y: number;
  timer: number;
  maxTimer: number;
}

// === Level Config ===

/** Configuration for a single game level including map, enemies, and spawn points. */
export interface LevelConfig {
  id: number;
  name: string;
  /** 26x26 grid of TileType values. */
  mapData: number[][];
  enemySpawnQueue: EnemyType[];
  maxEnemiesOnField: number;
  hasBoss: boolean;
  bossType?: EnemyType;
  enemySpawnPoints: Point[];
  /** Spawn point for Player 1. */
  playerSpawnPoint: Point;
  /** Spawn point for Player 2. */
  player2SpawnPoint: Point;
}

// === Game State (engine-side, not React) ===

/** Complete engine-side game state, updated every frame. */
export interface GameState {
  phase: GamePhase;
  currentLevel: number;
  /** Per-player score array, indexed by PlayerIndex. */
  scores: number[];
  /** Per-player lives array, indexed by PlayerIndex. */
  lives: number[];
  /** Active player tanks (length 1 in single-player, up to 2 in two-player). */
  players: PlayerTank[];
  enemies: EnemyTank[];
  bullets: Bullet[];
  powerUps: PowerUp[];
  explosions: Explosion[];
  particles: Particle[];
  spawnEffects: SpawnEffect[];
  /** 26x26 grid of TileType values (mutable copy of level data). */
  mapData: number[][];
  /** 4-bit quadrant health per brick tile. */
  brickHealth: number[][];
  baseDestroyed: boolean;
  enemySpawnQueue: EnemyType[];
  enemySpawnTimer: number;
  enemiesOnField: number;
  /** Global freeze timer from TIME_FREEZE power-up (ms). */
  freezeTimer: number;
  stageIntroTimer: number;
  levelCompleteTimer: number;
  gameOverTimer: number;
  /** Current game mode: 1 = single player, 2 = two-player coop. */
  gameMode: GameMode;
  /** Start screen menu selection: 1 = 1P, 2 = 2P. */
  menuSelection: GameMode;
}
