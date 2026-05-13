/**
 * 坦克大战游戏类型定义
 *
 * 定义游戏中所有 TypeScript 类型和接口，包括方向、地图格子类型、
 * 坦克、子弹、爆炸动画、道具和完整游戏状态。
 *
 * @module tank-battle/types/game
 */

/** 移动方向 */
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

/** 游戏状态 */
export type GameStatus = 'idle' | 'playing' | 'paused' | 'over' | 'won';

/** 地图格子类型 */
export enum TileType {
  EMPTY = 0,
  BRICK = 1,
  STEEL = 2,
  WATER = 3,
  TREE = 4,
  BASE = 5,
}

/** 二维坐标（格子级别） */
export interface Position {
  x: number;
  y: number;
}

/** 子弹 */
export interface Bullet {
  id: number;
  x: number;
  y: number;
  direction: Direction;
  speed: number;
  fromPlayer: boolean;
}

/** 坦克 */
export interface Tank {
  id: number;
  x: number;
  y: number;
  direction: Direction;
  speed: number;
  hp: number;
  lastShot: number;
  cooldown: number;
}

/** 爆炸动画 */
export interface Explosion {
  id: number;
  x: number;
  y: number;
  frame: number;
  maxFrames: number;
}

/** 道具类型 */
export enum PowerUpType {
  STAR = 'STAR',
  SHIELD = 'SHIELD',
  LIFE = 'LIFE',
}

/** 道具 */
export interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: PowerUpType;
}

/** 游戏配置 */
export interface TankGameConfig {
  cols: number;
  rows: number;
  tileSize: number;
  playerSpeed: number;
  enemySpeed: number;
  bulletSpeed: number;
  playerCooldown: number;
  enemyCooldown: number;
  maxEnemiesOnScreen: number;
  totalEnemies: number;
  playerLives: number;
  tickInterval: number;
}

/** 游戏完整状态 */
export interface TankGameState {
  status: GameStatus;
  map: TileType[][];
  player: Tank;
  enemies: Tank[];
  playerBullets: Bullet[];
  enemyBullets: Bullet[];
  explosions: Explosion[];
  powerUps: PowerUp[];
  score: number;
  lives: number;
  level: number;
  enemiesRemaining: number;
  shieldTimer: number;
}
