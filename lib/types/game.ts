/**
 * 游戏中心共享类型定义
 *
 * 所有游戏共用的基础类型，各游戏在此基础上扩展自己的特定类型。
 *
 * @module lib/types/game
 */

/**
 * 规范的游戏状态超集
 *
 * 涵盖所有游戏可能出现的状态值。各游戏通常通过 `Extract` 挑选自身使用的子集：
 *
 * ```ts
 * type MyGameStatus = Extract<GameStatus, 'idle' | 'playing' | 'paused' | 'over'>;
 * ```
 */
export type GameStatus = 'idle' | 'playing' | 'paused' | 'over' | 'won' | 'lost';

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

/** 二维空间中的矩形（用于碰撞检测、布局计算等） */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 游戏 Hook 返回值的基础接口
 *
 * 所有游戏 Hook 应至少包含这些字段，并在此基础上扩展游戏特定的字段。
 * 新增游戏时，Hook 返回类型应 `extends BaseGameHookReturn`。
 */
export interface BaseGameHookReturn {
  status: GameStatus;
  score: number;
  highScore: number;
  start: () => void;
  restart: () => void;
  togglePause?: () => void;
}
