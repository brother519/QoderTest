/**
 * 游戏中心共享类型定义
 *
 * 所有游戏共用的基础类型，各游戏在此基础上扩展自己的特定类型。
 *
 * @module lib/types/game
 */

/** 基础游戏状态（各游戏可根据需要扩展，如 'won' 等） */
export type BaseGameStatus = 'idle' | 'playing' | 'paused' | 'over';

/** 二维坐标 */
export interface Position {
  x: number;
  y: number;
}

/** 棋盘坐标（行列索引） */
export interface GridPosition {
  row: number;
  col: number;
}
