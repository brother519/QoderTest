import { BoardConfig } from '../types/game';

export const DEFAULT_CONFIG: BoardConfig = {
    boardSize: 15,
    winLength: 5,
    cellSize: 36,
};

export const BOARD_PADDING = 24;

/** 星位坐标 (0-indexed) */
export const STAR_POINTS: Array<{ row: number; col: number }> = [
    { row: 3, col: 3 },
    { row: 3, col: 11 },
    { row: 11, col: 3 },
    { row: 11, col: 11 },
    { row: 7, col: 7 },
];
