/**
 * Maze game configuration constants
 *
 * @module maze/constants/config
 */

import { Difficulty } from '../types/game';

/** Grid sizes per difficulty (must be odd numbers for proper maze generation) */
export const GRID_SIZES: Record<Difficulty, number> = {
    easy: 11,
    medium: 21,
    hard: 31,
};

/** Cell pixel sizes per difficulty (scale down for larger mazes) */
export const CELL_SIZES: Record<Difficulty, number> = {
    easy: 36,
    medium: 22,
    hard: 16,
};

/** localStorage key prefix for best times */
export const STORAGE_KEY_PREFIX = 'maze-best-time';

/** Difficulty labels for display */
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
};

/** All available difficulties in order */
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
