import { BoardConfig } from '../types/game';

export const DEFAULT_CONFIG: BoardConfig = {
    boardSize: 8,
    cellSize: 56,
};

export const BOARD_PADDING = 20;

export const AI_THINKING_MS = 500;

/** 8 个方向单位向量 */
export const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
];

/**
 * 位置价值权重 (8x8)
 *
 * 角是最优位置(不可被翻转)，角旁的格子是最劣位置(易让对手抢角)。
 */
export const POSITION_WEIGHTS: ReadonlyArray<ReadonlyArray<number>> = [
    [120, -20, 20, 5, 5, 20, -20, 120],
    [-20, -40, -5, -5, -5, -5, -40, -20],
    [20, -5, 15, 3, 3, 15, -5, 20],
    [5, -5, 3, 3, 3, 3, -5, 5],
    [5, -5, 3, 3, 3, 3, -5, 5],
    [20, -5, 15, 3, 3, 15, -5, 20],
    [-20, -40, -5, -5, -5, -5, -40, -20],
    [120, -20, 20, 5, 5, 20, -20, 120],
];
