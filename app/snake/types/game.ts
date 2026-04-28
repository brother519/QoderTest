/**
 * 贪吃蛇游戏类型定义
 *
 * @module snake/types/game
 */

import type { Position as BasePosition } from '@/lib/types/game';

/** 坐标位置 - 复用基础类型 */
export type Position = BasePosition;

/** 移动方向 */
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

/** 游戏状态 */
export type GameStatus = 'idle' | 'playing' | 'paused' | 'over';

/** 游戏配置 */
export interface GameConfig {
  /** 网格列数 */
  cols: number;
  /** 网格行数 */
  rows: number;
  /** 单格像素尺寸 */
  gridSize: number;
  /** 基础移动间隔（毫秒） */
  baseInterval: number;
  /** 最小移动间隔（毫秒），即最大速度 */
  minInterval: number;
  /** 每次加速减少的间隔（毫秒） */
  speedStep: number;
  /** 每吃多少分加速一次 */
  speedThreshold: number;
}
