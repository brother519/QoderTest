/**
 * 数独游戏类型定义
 *
 * @module sudoku/types/game
 */

import { GameStatus } from '@/lib/types/game';

/** 数独单元格 */
export interface SudokuCell {
    value: number;
    isGiven: boolean;
    notes: Set<number>;
    hasConflict: boolean;
}

/** 数独游戏状态 */
export type SudokuGameStatus = Extract<GameStatus, 'idle' | 'playing' | 'won' | 'lost'>;

/** 数独难度 */
export type SudokuDifficulty = 'easy' | 'medium' | 'hard';

/** 撤销历史记录 */
export interface HistoryEntry {
    row: number;
    col: number;
    prevValue: number;
    prevNotes: Set<number>;
    prevIsGiven: boolean;
}
