/**
 * 扫雷游戏类型定义
 *
 * @module minesweeper/types/game
 */

import type { GameStatus as BaseGameStatus, GridPosition as BaseGridPosition } from '@/lib/types/game';

/** 单元格数据 */
export interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
  isExploded: boolean;
}

/** 棋盘坐标 */
export type GridPosition = BaseGridPosition;

/** 难度键 */
export type DifficultyKey = 'beginner' | 'intermediate' | 'expert';

/** 难度配置 */
export interface Difficulty {
  key: DifficultyKey;
  label: string;
  rows: number;
  cols: number;
  mines: number;
}

/** 游戏状态 */
export type GameStatus = Extract<BaseGameStatus, 'idle' | 'playing'> | 'won' | 'lost';

/** 最佳时间记录（秒） */
export type BestTimeMap = Partial<Record<DifficultyKey, number>>;

/** 单个难度的统计记录 */
export interface DifficultyStats {
    gamesPlayed: number;
    gamesWon: number;
    totalTime: number;
}

/** 完整统计记录（按难度分组） */
export type GameStatsMap = Partial<Record<DifficultyKey, DifficultyStats>>;
