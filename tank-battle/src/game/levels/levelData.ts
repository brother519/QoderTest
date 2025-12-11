import type { GameMap } from '../types';
import { TileType } from '../types';

const E = TileType.EMPTY;
const B = TileType.BRICK;
const S = TileType.STEEL;
const W = TileType.WATER;
const X = TileType.BASE;

export const LEVEL_1: GameMap = [
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
  [E,E,B,B,E,E,B,B,E,E,B,B,E,E,B,B,E,E,B,B,E,E,B,B,E,E],
  [E,E,B,B,E,E,B,B,E,E,B,B,E,E,B,B,E,E,B,B,E,E,B,B,E,E],
  [E,E,B,B,E,E,B,B,E,E,B,B,E,E,B,B,E,E,B,B,E,E,B,B,E,E],
  [E,E,B,B,E,E,B,B,E,E,B,B,S,S,B,B,E,E,B,B,E,E,B,B,E,E],
  [E,E,B,B,E,E,B,B,E,E,B,B,S,S,B,B,E,E,B,B,E,E,B,B,E,E],
  [E,E,B,B,E,E,B,B,E,E,B,B,E,E,B,B,E,E,B,B,E,E,B,B,E,E],
  [E,E,B,B,E,E,B,B,E,E,E,E,E,E,E,E,E,E,B,B,E,E,B,B,E,E],
  [E,E,B,B,E,E,B,B,E,E,E,E,E,E,E,E,E,E,B,B,E,E,B,B,E,E],
  [E,E,E,E,E,E,E,E,E,E,B,B,E,E,B,B,E,E,E,E,E,E,E,E,E,E],
  [E,E,E,E,E,E,E,E,E,E,B,B,E,E,B,B,E,E,E,E,E,E,E,E,E,E],
  [E,E,B,B,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,B,B,E,E],
  [E,E,E,E,E,E,B,B,E,E,E,E,E,E,E,E,E,E,B,B,E,E,E,E,E,E],
  [E,E,E,E,E,E,B,B,E,E,E,E,E,E,E,E,E,E,B,B,E,E,E,E,E,E],
  [E,E,W,W,E,E,E,E,E,E,B,B,B,B,B,B,E,E,E,E,E,E,W,W,E,E],
  [E,E,W,W,E,E,E,E,E,E,B,B,B,B,B,B,E,E,E,E,E,E,W,W,E,E],
  [E,E,E,E,E,E,B,B,E,E,E,E,E,E,E,E,E,E,B,B,E,E,E,E,E,E],
  [E,E,E,E,E,E,B,B,E,E,E,E,E,E,E,E,E,E,B,B,E,E,E,E,E,E],
  [E,E,B,B,E,E,B,B,E,E,E,E,E,E,E,E,E,E,B,B,E,E,B,B,E,E],
  [E,E,B,B,E,E,B,B,E,E,E,E,E,E,E,E,E,E,B,B,E,E,B,B,E,E],
  [E,E,B,B,E,E,B,B,E,E,E,B,B,B,B,E,E,E,B,B,E,E,B,B,E,E],
  [E,E,B,B,E,E,B,B,E,E,E,B,X,X,B,E,E,E,B,B,E,E,B,B,E,E],
  [E,E,B,B,E,E,B,B,E,E,E,B,X,X,B,E,E,E,B,B,E,E,B,B,E,E],
  [E,E,E,E,E,E,E,E,E,E,E,B,B,B,B,E,E,E,E,E,E,E,E,E,E,E],
];

export const LEVEL_2: GameMap = [
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
  [E,E,B,B,B,B,E,E,E,E,S,S,S,S,E,E,E,E,B,B,B,B,E,E,E,E],
  [E,E,B,B,B,B,E,E,E,E,S,S,S,S,E,E,E,E,B,B,B,B,E,E,E,E],
  [E,E,B,B,B,B,E,E,E,E,S,S,S,S,E,E,E,E,B,B,B,B,E,E,E,E],
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
  [E,E,E,E,E,E,E,E,W,W,W,W,W,W,W,W,E,E,E,E,E,E,E,E,E,E],
  [E,E,E,E,E,E,E,E,W,W,W,W,W,W,W,W,E,E,E,E,E,E,E,E,E,E],
  [E,E,S,S,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,S,S,E,E],
  [E,E,S,S,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,S,S,E,E],
  [E,E,E,E,E,E,B,B,B,B,E,E,E,E,B,B,B,B,E,E,E,E,E,E,E,E],
  [E,E,E,E,E,E,B,B,B,B,E,E,E,E,B,B,B,B,E,E,E,E,E,E,E,E],
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
  [E,E,B,B,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,B,B,E,E],
  [E,E,B,B,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,B,B,E,E],
  [E,E,B,B,E,E,W,W,W,W,E,E,E,E,W,W,W,W,E,E,E,E,B,B,E,E],
  [E,E,B,B,E,E,W,W,W,W,E,E,E,E,W,W,W,W,E,E,E,E,B,B,E,E],
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
  [E,E,E,E,E,E,S,S,S,S,E,E,E,E,S,S,S,S,E,E,E,E,E,E,E,E],
  [E,E,B,B,E,E,S,S,S,S,E,E,E,E,S,S,S,S,E,E,B,B,E,E,E,E],
  [E,E,B,B,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,B,B,E,E,E,E],
  [E,E,B,B,E,E,E,E,E,E,B,B,B,B,E,E,E,E,E,E,B,B,E,E,E,E],
  [E,E,B,B,E,E,E,E,E,E,B,X,X,B,E,E,E,E,E,E,B,B,E,E,E,E],
  [E,E,B,B,E,E,E,E,E,E,B,X,X,B,E,E,E,E,E,E,B,B,E,E,E,E],
  [E,E,E,E,E,E,E,E,E,E,B,B,B,B,E,E,E,E,E,E,E,E,E,E,E,E],
];

export const LEVEL_3: GameMap = [
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
  [S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S],
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
  [E,E,B,B,B,B,B,B,E,E,E,E,E,E,E,E,E,E,B,B,B,B,B,B,E,E],
  [E,E,B,B,B,B,B,B,E,E,E,E,E,E,E,E,E,E,B,B,B,B,B,B,E,E],
  [E,E,B,B,B,B,B,B,E,E,E,E,E,E,E,E,E,E,B,B,B,B,B,B,E,E],
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
  [E,E,E,E,E,E,E,E,W,W,W,W,W,W,W,W,E,E,E,E,E,E,E,E,E,E],
  [E,E,E,E,E,E,E,E,W,W,W,W,W,W,W,W,E,E,E,E,E,E,E,E,E,E],
  [E,E,E,E,E,E,E,E,W,W,W,W,W,W,W,W,E,E,E,E,E,E,E,E,E,E],
  [E,E,E,E,E,E,E,E,W,W,W,W,W,W,W,W,E,E,E,E,E,E,E,E,E,E],
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
  [E,E,B,B,B,B,E,E,E,E,E,E,E,E,E,E,E,E,E,E,B,B,B,B,E,E],
  [E,E,B,B,B,B,E,E,E,E,E,E,E,E,E,E,E,E,E,E,B,B,B,B,E,E],
  [E,E,B,B,B,B,E,E,E,E,E,E,E,E,E,E,E,E,E,E,B,B,B,B,E,E],
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
  [E,E,E,E,E,E,E,E,S,S,S,S,S,S,S,S,E,E,E,E,E,E,E,E,E,E],
  [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
  [E,E,B,B,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,B,B,E,E],
  [E,E,B,B,E,E,B,B,B,B,E,E,E,E,E,E,B,B,B,B,E,E,B,B,E,E],
  [E,E,B,B,E,E,B,B,B,B,E,B,B,B,B,E,B,B,B,B,E,E,B,B,E,E],
  [E,E,B,B,E,E,B,B,B,B,E,B,X,X,B,E,B,B,B,B,E,E,B,B,E,E],
  [E,E,B,B,E,E,B,B,B,B,E,B,X,X,B,E,B,B,B,B,E,E,B,B,E,E],
  [E,E,E,E,E,E,E,E,E,E,E,B,B,B,B,E,E,E,E,E,E,E,E,E,E,E],
];

export interface LevelConfig {
  levelNumber: number;
  map: GameMap;
  enemyCount: number;
}

export const LEVELS: LevelConfig[] = [
  { levelNumber: 1, map: LEVEL_1, enemyCount: 10 },
  { levelNumber: 2, map: LEVEL_2, enemyCount: 15 },
  { levelNumber: 3, map: LEVEL_3, enemyCount: 20 },
];