/**
 * 猜数字游戏配置常量
 *
 * @module guess-number/constants/config
 */

import { Difficulty, DifficultyConfig } from '../types/game';

/** 各难度的具体配置 */
export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
    easy: { codeLength: 3, maxAttempts: 12, digitRange: 6 },
    medium: { codeLength: 4, maxAttempts: 10, digitRange: 8 },
    hard: { codeLength: 5, maxAttempts: 8, digitRange: 10 },
};

/** 难度标签 */
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
};

/** localStorage 高分 key 前缀 */
export const HIGH_SCORE_KEY_PREFIX = 'guess-number-best-';
