/**
 * 接水管游戏常量配置
 *
 * @module pipe-puzzle/constants/config
 */

import { PipePuzzleConfig } from '../types/game';

/** 各难度配置 */
export const DIFFICULTY_CONFIG: Record<string, PipePuzzleConfig> = {
    easy: { rows: 5, cols: 5, difficulty: 'easy' },
    medium: { rows: 6, cols: 6, difficulty: 'medium' },
    hard: { rows: 7, cols: 7, difficulty: 'hard' },
};

/** 默认配置 */
export const DEFAULT_CONFIG: PipePuzzleConfig = DIFFICULTY_CONFIG.easy;

/** 每关基础得分 */
export const BASE_LEVEL_SCORE = 100;

/** 每步扣分 */
export const MOVE_PENALTY = 2;

/** 格子尺寸 (px) */
export const CELL_SIZE = 60;

/** 管道线宽比例 */
export const PIPE_WIDTH_RATIO = 0.35;
