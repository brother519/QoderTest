/**
 * 坦克大战游戏配置常量
 *
 * 定义默认游戏配置、经典第一关地图（26x26 格子）、
 * 敌人出生点、玩家出生点和计分规则。
 *
 * @module tank-battle/constants/config
 */

import { TankGameConfig, TileType } from '../types/game';

const T = TileType;

export const DEFAULT_CONFIG: TankGameConfig = {
  cols: 26,
  rows: 26,
  tileSize: 16,
  playerSpeed: 2,
  enemySpeed: 1,
  bulletSpeed: 4,
  playerCooldown: 300,
  enemyCooldown: 1500,
  maxEnemiesOnScreen: 4,
  totalEnemies: 20,
  playerLives: 3,
  tickInterval: 33, // ~30fps
};

/** 经典第一关地图 (26x26) — 0=空 1=砖 2=钢 3=水 4=树 5=基地 */
export const LEVEL_1: TileType[][] = buildLevel1();

function buildLevel1(): TileType[][] {
  const map: TileType[][] = Array.from({ length: 26 }, () =>
    Array(26).fill(T.EMPTY)
  );

  const setBricks = (startR: number, startC: number, h: number, w: number) => {
    for (let r = startR; r < startR + h && r < 26; r++)
      for (let c = startC; c < startC + w && c < 26; c++)
        map[r][c] = T.BRICK;
  };

  // 砖墙列
  setBricks(2, 2, 8, 2);
  setBricks(2, 6, 8, 2);
  setBricks(2, 10, 4, 2);
  setBricks(2, 14, 4, 2);
  setBricks(2, 18, 8, 2);
  setBricks(2, 22, 8, 2);

  // 中间区域砖墙
  setBricks(12, 0, 2, 4);
  setBricks(12, 10, 2, 6);
  setBricks(12, 22, 2, 4);

  // 下半部分
  setBricks(14, 6, 4, 2);
  setBricks(14, 18, 4, 2);
  setBricks(16, 2, 4, 2);
  setBricks(16, 22, 4, 2);
  setBricks(16, 10, 2, 6);
  setBricks(20, 6, 4, 2);
  setBricks(20, 18, 4, 2);
  setBricks(20, 10, 2, 2);
  setBricks(20, 14, 2, 2);

  // 钢墙
  map[12][6] = T.STEEL;
  map[12][7] = T.STEEL;
  map[12][18] = T.STEEL;
  map[12][19] = T.STEEL;
  map[6][12] = T.STEEL;
  map[6][13] = T.STEEL;

  // 水域
  map[14][12] = T.WATER;
  map[14][13] = T.WATER;
  map[15][12] = T.WATER;
  map[15][13] = T.WATER;

  // 树丛
  map[10][4] = T.TREE;
  map[10][5] = T.TREE;
  map[10][20] = T.TREE;
  map[10][21] = T.TREE;

  // 基地（底部中间）
  map[24][12] = T.BASE;
  map[24][13] = T.BASE;
  map[25][12] = T.BASE;
  map[25][13] = T.BASE;
  // 基地周围砖墙保护
  setBricks(23, 11, 1, 4);
  map[24][11] = T.BRICK;
  map[25][11] = T.BRICK;
  map[24][14] = T.BRICK;
  map[25][14] = T.BRICK;

  return map;
}

/** 敌人出生点（顶部3个位置，格子坐标） */
export const ENEMY_SPAWNS = [
  { x: 0, y: 0 },
  { x: 12, y: 0 },
  { x: 24, y: 0 },
];

/** 玩家出生点 */
export const PLAYER_SPAWN = { x: 8, y: 24 };

export const SCORE_PER_ENEMY = 100;
export const SCORE_PER_POWERUP = 200;
