/**
 * 推箱子游戏配置常量
 *
 * @module sokoban/constants/config
 */

/** 格子像素尺寸 */
export const CELL_SIZE = 48;

/** localStorage 中保存最佳记录的 key 前缀 */
export const BEST_SCORE_KEY_PREFIX = 'sokoban_best_';

/** 方向向量映射 */
export const DIRECTION_DELTA: Record<string, { row: number; col: number }> = {
    up: { row: -1, col: 0 },
    down: { row: 1, col: 0 },
    left: { row: 0, col: -1 },
    right: { row: 0, col: 1 },
};

/** 键盘按键到方向的映射 */
export const KEY_TO_DIRECTION: Record<string, string> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    w: 'up',
    s: 'down',
    a: 'left',
    d: 'right',
    W: 'up',
    S: 'down',
    A: 'left',
    D: 'right',
};
