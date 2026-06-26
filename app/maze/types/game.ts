/**
 * Maze game type definitions
 *
 * @module maze/types/game
 */

import { GameStatus } from '@/lib/types/game';

/** Wall states for a single maze cell */
export interface MazeCell {
    /** Whether the top wall exists */
    top: boolean;
    /** Whether the right wall exists */
    right: boolean;
    /** Whether the bottom wall exists */
    bottom: boolean;
    /** Whether the left wall exists */
    left: boolean;
    /** Whether this cell has been visited during generation */
    visited: boolean;
}

/** 2D array of maze cells */
export type MazeGrid = MazeCell[][];

/** Movement directions */
export type MazeDirection = 'up' | 'down' | 'left' | 'right';

/** Difficulty levels */
export type Difficulty = 'easy' | 'medium' | 'hard';

/** Game status subset used by maze */
export type MazeGameStatus = Extract<GameStatus, 'idle' | 'playing' | 'won'>;

/** Player position in the grid */
export interface PlayerPosition {
    row: number;
    col: number;
}

/** Best times record per difficulty */
export type BestTimes = Record<Difficulty, number | null>;
