import type { LevelConfig } from '../types/game';
import { EnemyType, TileType } from '../types/game';
import { TILE_SIZE, TANK_SIZE } from '../constants/config';

// Helper: shorthand aliases
const _ = TileType.EMPTY;
const B = TileType.BRICK;
const S = TileType.STEEL;
const W = TileType.WATER;
const T = TileType.TREES;
const I = TileType.ICE;
const X = TileType.BASE;

// Standard spawn points (in pixel coords)
const ENEMY_SPAWNS = [
  { x: 0, y: 0 },
  { x: 12 * TILE_SIZE, y: 0 },
  { x: 24 * TILE_SIZE, y: 0 },
];

const PLAYER_SPAWN = { x: 8 * TILE_SIZE, y: 24 * TILE_SIZE };

// ============ LEVEL 1: Training Ground ============
const level1Map: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_],
  [_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_],
  [_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_],
  [_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_],
  [_,_,_,_,_,_,_,_,_,_,B,B,_,_,B,B,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,B,B,_,_,B,B,_,_,_,_,_,_,_,_,_,_],
  [_,_,B,B,_,_,B,B,_,_,_,_,_,_,_,_,_,_,B,B,_,_,B,B,_,_],
  [_,_,B,B,_,_,B,B,_,_,_,_,_,_,_,_,_,_,B,B,_,_,B,B,_,_],
  [_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_],
  [_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_],
  [_,_,_,_,_,_,_,_,_,_,B,B,_,_,B,B,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,B,B,_,_,B,B,_,_,_,_,_,_,_,_,_,_],
  [_,_,B,B,_,_,B,B,_,_,_,_,_,_,_,_,_,_,B,B,_,_,B,B,_,_],
  [_,_,B,B,_,_,B,B,_,_,_,_,_,_,_,_,_,_,B,B,_,_,B,B,_,_],
  [_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_],
  [_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_],
  [_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_],
  [_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,B,B,B,B,_,_,B,B,B,B,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,B,_,_,_,_,_,_,_,_,B,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,B,_,_,_,X,X,_,_,_,B,_,_,_,_,_,_,_,_],
];

// ============ LEVEL 2: River Crossing ============
const level2Map: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,B,B,_,_,B,B,_,_,T,T,_,_,T,T,_,_,B,B,_,_,B,B,_,_],
  [_,_,B,B,_,_,B,B,_,_,T,T,_,_,T,T,_,_,B,B,_,_,B,B,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,W,W,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,W,W,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,B,B,_,_,S,S,_,_,W,W,W,W,W,W,_,_,S,S,_,_,B,B,_,_],
  [_,_,B,B,_,_,S,S,_,_,W,W,W,W,W,W,_,_,S,S,_,_,B,B,_,_],
  [_,_,_,_,_,_,_,_,_,_,W,W,W,W,W,W,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,W,W,W,W,W,W,_,_,_,_,_,_,_,_,_,_],
  [_,_,B,B,_,_,B,B,_,_,_,_,W,W,_,_,_,_,B,B,_,_,B,B,_,_],
  [_,_,B,B,_,_,B,B,_,_,_,_,W,W,_,_,_,_,B,B,_,_,B,B,_,_],
  [T,T,_,_,_,_,_,_,T,T,_,_,_,_,_,_,T,T,_,_,_,_,_,_,T,T],
  [T,T,_,_,_,_,_,_,T,T,_,_,_,_,_,_,T,T,_,_,_,_,_,_,T,T],
  [_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_],
  [_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_],
  [_,_,B,B,_,_,B,B,_,_,_,_,_,_,_,_,_,_,B,B,_,_,B,B,_,_],
  [_,_,B,B,_,_,B,B,_,_,_,_,_,_,_,_,_,_,B,B,_,_,B,B,_,_],
  [_,_,_,_,T,T,_,_,_,_,B,B,_,_,B,B,_,_,_,_,T,T,_,_,_,_],
  [_,_,_,_,T,T,_,_,_,_,B,B,_,_,B,B,_,_,_,_,T,T,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,B,B,B,B,_,_,B,B,B,B,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,B,_,_,_,_,_,_,_,_,B,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,B,_,_,_,X,X,_,_,_,B,_,_,_,_,_,_,_,_],
];

// ============ LEVEL 3: Ice Field ============
const level3Map: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,I,I,I,I,_,_,B,B,_,_,S,S,_,_,B,B,_,_,I,I,I,I,_,_],
  [_,_,I,I,I,I,_,_,B,B,_,_,S,S,_,_,B,B,_,_,I,I,I,I,_,_],
  [_,_,I,I,_,_,_,_,B,B,_,_,_,_,_,_,B,B,_,_,_,_,I,I,_,_],
  [_,_,I,I,_,_,_,_,B,B,_,_,_,_,_,_,B,B,_,_,_,_,I,I,_,_],
  [_,_,_,_,_,_,S,S,_,_,I,I,I,I,I,I,_,_,S,S,_,_,_,_,_,_],
  [_,_,_,_,_,_,S,S,_,_,I,I,I,I,I,I,_,_,S,S,_,_,_,_,_,_],
  [_,_,B,B,_,_,_,_,_,_,I,I,I,I,I,I,_,_,_,_,_,_,B,B,_,_],
  [_,_,B,B,_,_,_,_,_,_,I,I,I,I,I,I,_,_,_,_,_,_,B,B,_,_],
  [_,_,_,_,_,_,B,B,_,_,_,_,_,_,_,_,_,_,B,B,_,_,_,_,_,_],
  [_,_,_,_,_,_,B,B,_,_,_,_,_,_,_,_,_,_,B,B,_,_,_,_,_,_],
  [I,I,_,_,S,S,_,_,_,_,B,B,_,_,B,B,_,_,_,_,S,S,_,_,I,I],
  [I,I,_,_,S,S,_,_,_,_,B,B,_,_,B,B,_,_,_,_,S,S,_,_,I,I],
  [_,_,_,_,_,_,_,_,B,B,_,_,_,_,_,_,B,B,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,B,B,_,_,_,_,_,_,B,B,_,_,_,_,_,_,_,_],
  [_,_,B,B,_,_,I,I,I,I,_,_,B,B,_,_,I,I,I,I,_,_,B,B,_,_],
  [_,_,B,B,_,_,I,I,I,I,_,_,B,B,_,_,I,I,I,I,_,_,B,B,_,_],
  [_,_,B,B,_,_,_,_,_,_,_,_,B,B,_,_,_,_,_,_,_,_,B,B,_,_],
  [_,_,B,B,_,_,_,_,_,_,_,_,B,B,_,_,_,_,_,_,_,_,B,B,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,B,B,B,B,_,_,B,B,B,B,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,B,_,_,_,_,_,_,_,_,B,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,B,_,_,_,X,X,_,_,_,B,_,_,_,_,_,_,_,_],
];

// ============ LEVEL 4: Boss Fortress ============
const level4Map: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,S,S,_,_,B,B,B,B,_,_,S,S,_,_,B,B,B,B,_,_,S,S,_,_],
  [_,_,S,S,_,_,B,B,B,B,_,_,S,S,_,_,B,B,B,B,_,_,S,S,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [B,B,_,_,S,S,_,_,W,W,_,_,B,B,_,_,W,W,_,_,S,S,_,_,B,B],
  [B,B,_,_,S,S,_,_,W,W,_,_,B,B,_,_,W,W,_,_,S,S,_,_,B,B],
  [_,_,_,_,_,_,_,_,W,W,_,_,_,_,_,_,W,W,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,W,W,_,_,_,_,_,_,W,W,_,_,_,_,_,_,_,_],
  [_,_,B,B,_,_,B,B,_,_,S,S,_,_,S,S,_,_,B,B,_,_,B,B,_,_],
  [_,_,B,B,_,_,B,B,_,_,S,S,_,_,S,S,_,_,B,B,_,_,B,B,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,T,T,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,T,T,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,B,B,_,_,S,S,_,_,B,B,_,_,B,B,_,_,S,S,_,_,B,B,_,_],
  [_,_,B,B,_,_,S,S,_,_,B,B,_,_,B,B,_,_,S,S,_,_,B,B,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [T,T,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,T,T],
  [T,T,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,_,_,B,B,T,T],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,S,S,B,B,_,_,B,B,S,S,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,S,_,_,_,_,_,_,_,_,S,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,S,_,_,_,X,X,_,_,_,S,_,_,_,_,_,_,_,_],
];

// ============ LEVEL 5: Ultimate Challenge ============
const level5Map: number[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,S,S,B,B,_,_,I,I,_,_,S,S,_,_,I,I,_,_,B,B,S,S,_,_],
  [_,_,S,S,B,B,_,_,I,I,_,_,S,S,_,_,I,I,_,_,B,B,S,S,_,_],
  [_,_,B,B,_,_,W,W,_,_,B,B,_,_,B,B,_,_,W,W,_,_,B,B,_,_],
  [_,_,B,B,_,_,W,W,_,_,B,B,_,_,B,B,_,_,W,W,_,_,B,B,_,_],
  [_,_,_,_,W,W,_,_,T,T,_,_,I,I,_,_,T,T,_,_,W,W,_,_,_,_],
  [_,_,_,_,W,W,_,_,T,T,_,_,I,I,_,_,T,T,_,_,W,W,_,_,_,_],
  [I,I,_,_,_,_,T,T,S,S,_,_,_,_,_,_,S,S,T,T,_,_,_,_,I,I],
  [I,I,_,_,_,_,T,T,S,S,_,_,_,_,_,_,S,S,T,T,_,_,_,_,I,I],
  [_,_,B,B,_,_,_,_,_,_,B,B,_,_,B,B,_,_,_,_,_,_,B,B,_,_],
  [_,_,B,B,_,_,_,_,_,_,B,B,_,_,B,B,_,_,_,_,_,_,B,B,_,_],
  [S,S,_,_,I,I,_,_,B,B,_,_,T,T,_,_,B,B,_,_,I,I,_,_,S,S],
  [S,S,_,_,I,I,_,_,B,B,_,_,T,T,_,_,B,B,_,_,I,I,_,_,S,S],
  [_,_,_,_,_,_,W,W,_,_,_,_,_,_,_,_,_,_,W,W,_,_,_,_,_,_],
  [_,_,_,_,_,_,W,W,_,_,_,_,_,_,_,_,_,_,W,W,_,_,_,_,_,_],
  [_,_,B,B,_,_,_,_,B,B,_,_,S,S,_,_,B,B,_,_,_,_,B,B,_,_],
  [_,_,B,B,_,_,_,_,B,B,_,_,S,S,_,_,B,B,_,_,_,_,B,B,_,_],
  [_,_,_,_,T,T,_,_,_,_,B,B,_,_,B,B,_,_,_,_,T,T,_,_,_,_],
  [_,_,_,_,T,T,_,_,_,_,B,B,_,_,B,B,_,_,_,_,T,T,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,S,S,B,B,_,_,B,B,S,S,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,S,_,_,_,_,_,_,_,_,S,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,S,_,_,_,X,X,_,_,_,S,_,_,_,_,_,_,_,_],
];

// ============ EXPORT LEVELS ============

export const levels: LevelConfig[] = [
  {
    id: 1,
    name: 'Training Ground',
    mapData: level1Map,
    enemySpawnQueue: [
      EnemyType.BASIC, EnemyType.BASIC, EnemyType.BASIC,
      EnemyType.BASIC, EnemyType.BASIC, EnemyType.FAST,
      EnemyType.FAST, EnemyType.BASIC, EnemyType.BASIC,
      EnemyType.BASIC,
    ],
    maxEnemiesOnField: 3,
    hasBoss: false,
    enemySpawnPoints: ENEMY_SPAWNS,
    playerSpawnPoint: PLAYER_SPAWN,
  },
  {
    id: 2,
    name: 'River Crossing',
    mapData: level2Map,
    enemySpawnQueue: [
      EnemyType.BASIC, EnemyType.FAST, EnemyType.BASIC,
      EnemyType.FAST, EnemyType.FAST, EnemyType.HEAVY,
      EnemyType.BASIC, EnemyType.FAST, EnemyType.BASIC,
      EnemyType.FAST, EnemyType.HEAVY, EnemyType.FAST,
    ],
    maxEnemiesOnField: 4,
    hasBoss: false,
    enemySpawnPoints: ENEMY_SPAWNS,
    playerSpawnPoint: PLAYER_SPAWN,
  },
  {
    id: 3,
    name: 'Ice Field',
    mapData: level3Map,
    enemySpawnQueue: [
      EnemyType.FAST, EnemyType.FAST, EnemyType.HEAVY,
      EnemyType.BASIC, EnemyType.ARTILLERY, EnemyType.FAST,
      EnemyType.HEAVY, EnemyType.FAST, EnemyType.ARTILLERY,
      EnemyType.HEAVY, EnemyType.FAST, EnemyType.FAST,
      EnemyType.HEAVY, EnemyType.ARTILLERY,
    ],
    maxEnemiesOnField: 4,
    hasBoss: false,
    enemySpawnPoints: ENEMY_SPAWNS,
    playerSpawnPoint: PLAYER_SPAWN,
  },
  {
    id: 4,
    name: 'Boss Fortress',
    mapData: level4Map,
    enemySpawnQueue: [
      EnemyType.HEAVY, EnemyType.FAST, EnemyType.ARTILLERY,
      EnemyType.HEAVY, EnemyType.FAST, EnemyType.FAST,
      EnemyType.ARTILLERY, EnemyType.HEAVY,
      EnemyType.BOSS,
    ],
    maxEnemiesOnField: 4,
    hasBoss: true,
    bossType: EnemyType.BOSS,
    enemySpawnPoints: ENEMY_SPAWNS,
    playerSpawnPoint: PLAYER_SPAWN,
  },
  {
    id: 5,
    name: 'Ultimate Challenge',
    mapData: level5Map,
    enemySpawnQueue: [
      EnemyType.FAST, EnemyType.HEAVY, EnemyType.ARTILLERY,
      EnemyType.FAST, EnemyType.HEAVY, EnemyType.FAST,
      EnemyType.ARTILLERY, EnemyType.HEAVY, EnemyType.FAST,
      EnemyType.HEAVY, EnemyType.ARTILLERY, EnemyType.FAST,
      EnemyType.HEAVY, EnemyType.FAST, EnemyType.ARTILLERY,
      EnemyType.BOSS,
    ],
    maxEnemiesOnField: 5,
    hasBoss: true,
    bossType: EnemyType.BOSS,
    enemySpawnPoints: ENEMY_SPAWNS,
    playerSpawnPoint: PLAYER_SPAWN,
  },
];
