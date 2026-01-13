export const TileType = {
  EMPTY: 0,
  BRICK: 1,
  STEEL: 2,
  WATER: 3,
  GRASS: 4,
  BASE: 5,
} as const;

export type TileType = typeof TileType[keyof typeof TileType];

export type Direction = 'up' | 'down' | 'left' | 'right';

export type EnemyType = 'basic' | 'fast' | 'armored';

export type GameStatus = 'menu' | 'playing' | 'paused' | 'levelTransition' | 'gameOver';

export type PowerUpType = 'shield' | 'rapidFire' | 'extraLife';

export interface Explosion {
  id: string;
  position: Position;
  frame: number;
  maxFrames: number;
}

export interface PowerUp {
  id: string;
  type: PowerUpType;
  position: Position;
  spawnTime: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Tank {
  id: string;
  type: 'player' | 'enemy';
  playerNumber?: 1 | 2;
  position: Position;
  direction: Direction;
  speed: number;
  isAlive: boolean;
  isSpawning: boolean;
  spawnTimer: number;
  shootCooldown: number;
  health: number;
  enemyType?: EnemyType;
  hasShield?: boolean;
  shieldTimer?: number;
  rapidFire?: boolean;
  rapidFireTimer?: number;
}

export interface Bullet {
  id: string;
  position: Position;
  direction: Direction;
  speed: number;
  owner: 'player' | 'enemy';
}

export interface Base {
  position: Position;
  isDestroyed: boolean;
}

export type GameMap = TileType[][];

export interface GameState {
  status: GameStatus;
  score: number;
  lives: number;
  level: number;
  map: GameMap;
  player: Tank | null;
  player2: Tank | null;
  enemies: Tank[];
  bullets: Bullet[];
  base: Base;
  spawnQueue: number;
  explosions: Explosion[];
  powerUps: PowerUp[];
  twoPlayerMode: boolean;
  player2Lives: number;
}

export type GameAction =
  | { type: 'INIT_LEVEL'; payload: { level: number; map: GameMap; enemyCount: number } }
  | { type: 'UPDATE_PLAYER'; payload: Partial<Tank> }
  | { type: 'SHOOT_BULLET'; payload: { owner: 'player' | 'enemy'; position: Position; direction: Direction } }
  | { type: 'UPDATE_BULLETS' }
  | { type: 'UPDATE_ENEMIES' }
  | { type: 'COLLISION_CHECK' }
  | { type: 'DESTROY_ENEMY'; payload: { enemyId: string } }
  | { type: 'DAMAGE_PLAYER' }
  | { type: 'DESTROY_TILE'; payload: { x: number; y: number } }
  | { type: 'SPAWN_ENEMY'; payload: Tank }
  | { type: 'NEXT_LEVEL' }
  | { type: 'GAME_OVER' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'START_GAME'; payload?: { twoPlayer?: boolean } }
  | { type: 'GAME_TICK'; payload: { input: InputState; input2?: InputState } }
  | { type: 'ADD_EXPLOSION'; payload: Explosion }
  | { type: 'UPDATE_EXPLOSIONS' }
  | { type: 'SPAWN_POWERUP'; payload: PowerUp }
  | { type: 'COLLECT_POWERUP'; payload: { powerUpId: string; playerId: string } };

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean;
  pause: boolean;
  enter: boolean;
}