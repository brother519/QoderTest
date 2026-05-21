/**
 * 消消乐游戏类型定义
 *
 * @module app/match-three/types/game
 */

/** 宝石类型（emoji 表示） */
export type GemType = string;

/** 单个宝石 */
export interface Gem {
  /** 唯一标识 */
  id: number;
  /** 宝石类型 */
  type: GemType;
  /** 行索引 */
  row: number;
  /** 列索引 */
  col: number;
}

/** 游戏棋盘（二维数组，可能含空位） */
export type Board = (Gem | null)[][];

/** 游戏状态 */
export type GameStatus = 'idle' | 'playing' | 'paused' | 'over' | 'won';

/** 交换方向 */
export type SwapDirection = 'up' | 'down' | 'left' | 'right';

/** 匹配结果 */
export interface MatchResult {
  /** 匹配到的位置列表 */
  positions: { row: number; col: number }[];
  /** 匹配的宝石类型 */
  type: GemType;
}

/** 关卡配置 */
export interface LevelConfig {
  /** 关卡标识 */
  id: string;
  /** 关卡名称 */
  name: string;
  /** 关卡描述 */
  description: string;
  /** 关卡图标 */
  icon: string;
  /** 目标分数 */
  targetScore: number;
  /** 可用步数 */
  moves: number;
  /** 行数 */
  rows: number;
  /** 列数 */
  cols: number;
  /** 可用宝石类型列表 */
  gemTypes: GemType[];
}

/** 游戏难度 */
export type GameLevel = 'easy' | 'medium' | 'hard';
