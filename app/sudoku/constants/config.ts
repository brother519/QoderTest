/**
 * 数独游戏常量配置
 *
 * @module sudoku/constants/config
 */

import { SudokuDifficulty } from '../types/game';

/** 网格大小 */
export const GRID_SIZE = 9;

/** 宫格大小 */
export const BOX_SIZE = 3;

/** 最大错误次数 */
export const MAX_MISTAKES = 3;

/** 难度配置：需要移除的单元格数量 */
export const DIFFICULTY_CONFIG: Record<SudokuDifficulty, number> = {
    easy: 36,
    medium: 45,
    hard: 52,
};

/** 难度标签 */
export const DIFFICULTY_LABELS: Record<SudokuDifficulty, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
};
