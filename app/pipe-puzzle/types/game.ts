/**
 * 接水管游戏类型定义
 *
 * @module pipe-puzzle/types/game
 */

import { GameStatus } from '@/lib/types/game';

/** 管道类型 */
export type PipeType = 'straight' | 'corner' | 'tee' | 'cross' | 'end';

/** 方向 (管道开口方向) */
export type PipeDirection = 'top' | 'right' | 'bottom' | 'left';

/** 旋转角度 (0, 90, 180, 270 度) */
export type Rotation = 0 | 1 | 2 | 3;

/** 单个管道格子 */
export interface PipeCell {
    /** 管道类型 */
    type: PipeType;
    /** 当前旋转 (0-3, 每次 +90 度) */
    rotation: Rotation;
    /** 是否为起点 */
    isSource: boolean;
    /** 是否为终点 */
    isTarget: boolean;
    /** 是否已被水流经过 */
    filled: boolean;
}

/** 棋盘坐标 */
export interface CellPosition {
    row: number;
    col: number;
}

/** 游戏难度 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/** 游戏配置 */
export interface PipePuzzleConfig {
    rows: number;
    cols: number;
    difficulty: Difficulty;
}

/** 游戏状态类型 */
export type PipePuzzleStatus = Extract<GameStatus, 'idle' | 'playing' | 'won'>;

/** Hook 返回类型 */
export interface UsePipePuzzleGameReturn {
    board: PipeCell[][];
    status: PipePuzzleStatus;
    moves: number;
    level: number;
    score: number;
    highScore: number;
    start: () => void;
    restart: () => void;
    nextLevel: () => void;
    rotatePipe: (row: number, col: number) => void;
}
