/**
 * Hanoi Tower Game Constants
 *
 * @module hanoi/constants/config
 */

import { HanoiConfig } from '../types/game';

/** 游戏配置 */
export const HANOI_CONFIG: HanoiConfig = {
    minLevel: 3,
    maxLevel: 8,
    diskColors: [
        '#ef4444', // red-500
        '#f97316', // orange-500
        '#eab308', // yellow-500
        '#22c55e', // green-500
        '#06b6d4', // cyan-500
        '#3b82f6', // blue-500
        '#8b5cf6', // violet-500
        '#ec4899', // pink-500
    ],
    animationDuration: 200,
};

/** localStorage 键名 */
export const STORAGE_KEY = 'hanoi-game-stats';

/** 画布尺寸 */
export const CANVAS = {
    width: 600,
    height: 400,
    pegWidth: 12,
    pegHeight: 200,
    diskHeight: 24,
    diskMaxWidth: 140,
    diskMinWidth: 40,
    pegSpacing: 200,
    baseHeight: 20,
};
