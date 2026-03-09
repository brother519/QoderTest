import { EnemyType, PowerUpType } from '../types/game';

// Grid and canvas
export const TILE_SIZE = 24; // pixels per tile
export const MAP_COLS = 26;
export const MAP_ROWS = 26;
export const CANVAS_WIDTH = MAP_COLS * TILE_SIZE; // 624
export const CANVAS_HEIGHT = MAP_ROWS * TILE_SIZE; // 624

// Tank sizes (in pixels)
export const TANK_SIZE = TILE_SIZE * 2; // 48px, occupies 2x2 tiles
export const BULLET_SIZE = 6;

// Player config
export const PLAYER_SPEED = 120; // pixels per second
export const PLAYER_FIRE_RATE = 400; // ms between shots
export const PLAYER_BULLET_SPEED = 300;
export const PLAYER_HEALTH = 1;
export const PLAYER_INITIAL_LIVES = 3;

// Enemy configs
export const ENEMY_CONFIG: Record<EnemyType, {
  speed: number;
  health: number;
  fireRate: number;
  bulletSpeed: number;
  bulletPower: number;
  score: number;
  color: string;
  bodyColor: string;
}> = {
  [EnemyType.BASIC]: {
    speed: 60,
    health: 1,
    fireRate: 2000,
    bulletSpeed: 200,
    bulletPower: 1,
    score: 100,
    color: '#888888',
    bodyColor: '#666666',
  },
  [EnemyType.FAST]: {
    speed: 140,
    health: 1,
    fireRate: 1200,
    bulletSpeed: 250,
    bulletPower: 1,
    score: 200,
    color: '#FF8C00',
    bodyColor: '#CC7000',
  },
  [EnemyType.HEAVY]: {
    speed: 40,
    health: 4,
    fireRate: 2500,
    bulletSpeed: 180,
    bulletPower: 1,
    score: 300,
    color: '#CC2222',
    bodyColor: '#991111',
  },
  [EnemyType.ARTILLERY]: {
    speed: 30,
    health: 2,
    fireRate: 1500,
    bulletSpeed: 350,
    bulletPower: 2,
    score: 400,
    color: '#9933CC',
    bodyColor: '#772299',
  },
  [EnemyType.BOSS]: {
    speed: 50,
    health: 15,
    fireRate: 800,
    bulletSpeed: 280,
    bulletPower: 2,
    score: 1000,
    color: '#FF1111',
    bodyColor: '#220000',
  },
};

// Spawn timing
export const ENEMY_SPAWN_INTERVAL = 3000; // ms between enemy spawns
export const SPAWN_ANIMATION_DURATION = 1000; // ms

// PowerUp config
export const POWERUP_DURATION = 10000; // ms for timed powerups
export const POWERUP_DROP_CHANCE = 0.25; // 25% chance enemy drops powerup
export const POWERUP_LIFETIME = 15000; // ms before powerup disappears

export const POWERUP_COLORS: Record<PowerUpType, string> = {
  [PowerUpType.SHIELD]: '#00CCFF',
  [PowerUpType.SPEED]: '#FFCC00',
  [PowerUpType.FIREPOWER]: '#FF4444',
  [PowerUpType.EXTRA_LIFE]: '#44FF44',
  [PowerUpType.BOMB]: '#FF8800',
  [PowerUpType.TIME_FREEZE]: '#AAAAFF',
};

// Explosion
export const EXPLOSION_DURATION = 300; // ms
export const BIG_EXPLOSION_DURATION = 500;

// Timers
export const STAGE_INTRO_DURATION = 2000; // ms
export const LEVEL_COMPLETE_DELAY = 3000;
export const GAME_OVER_DELAY = 3000;
export const RESPAWN_DELAY = 1500;

// Colors
export const COLORS = {
  background: '#000000',
  brick: '#B85C38',
  brickLine: '#8B4513',
  steel: '#AAAAAA',
  steelShine: '#CCCCCC',
  water: '#1A3A5C',
  waterWave: '#2A5A8C',
  trees: '#228B22',
  treesDark: '#006400',
  ice: '#ADD8E6',
  iceShine: '#E0F0FF',
  base: '#FFD700',
  baseDestroyed: '#444444',
  playerBody: '#33AA33',
  playerTurret: '#55DD55',
  playerTrack: '#225522',
  hudBackground: '#111111',
  hudText: '#FFFFFF',
};

// Player 2 spawn point (bottom-right area)
export const PLAYER2_SPAWN = { x: 16 * TILE_SIZE, y: 24 * TILE_SIZE } as const;

/** Per-player color configuration, indexed by PlayerIndex. */
export interface PlayerColorConfig {
  readonly body: string;
  readonly turret: string;
  readonly track: string;
}

/** Color sets for each player tank. P1 = green, P2 = blue. */
export const PLAYER_COLORS: readonly [PlayerColorConfig, PlayerColorConfig] = [
  { body: '#33AA33', turret: '#55DD55', track: '#225522' },
  { body: '#2266CC', turret: '#44AAFF', track: '#113366' },
] as const;

// Boss phases
export const BOSS_PHASE_2_HEALTH_RATIO = 0.5;
export const BOSS_PHASE_3_HEALTH_RATIO = 0.25;
