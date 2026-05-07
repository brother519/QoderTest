/**
 * 扫雷游戏配置常量
 *
 * @module minesweeper/constants/config
 */

import type { Difficulty, DifficultyKey } from '../types/game';

/** 最佳时间存储键 */
export const BEST_TIME_STORAGE_KEY = 'minesweeperBestTimes';

/** 移动端长按插旗时长（毫秒） */
export const LONG_PRESS_DURATION = 360;

/** 难度顺序 */
export const DIFFICULTY_ORDER: DifficultyKey[] = ['beginner', 'intermediate', 'expert'];

/** 难度配置映射 */
export const DIFFICULTIES: Record<DifficultyKey, Difficulty> = {
  beginner: {
    key: 'beginner',
    label: '初级',
    rows: 9,
    cols: 9,
    mines: 10,
  },
  intermediate: {
    key: 'intermediate',
    label: '中级',
    rows: 16,
    cols: 16,
    mines: 40,
  },
  expert: {
    key: 'expert',
    label: '高级',
    rows: 16,
    cols: 30,
    mines: 99,
  },
};

/** 默认难度 */
export const DEFAULT_DIFFICULTY: DifficultyKey = 'beginner';
