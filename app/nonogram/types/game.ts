import type { GameStatus } from '@/lib/types/game';

export type CellState = 'empty' | 'filled' | 'marked';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type NonogramStatus = Extract<GameStatus, 'idle' | 'playing' | 'won'>;

export interface Puzzle {
    id: string;
    name: string;
    size: number;
    solution: boolean[][];
}

export type Clues = number[][];

export interface NonogramState {
    grid: CellState[][];
    rowClues: Clues;
    colClues: Clues;
    status: NonogramStatus;
    difficulty: Difficulty;
    puzzle: Puzzle | null;
    timer: number;
    errors: number;
}

export interface UseNonogramGameReturn {
    grid: CellState[][];
    rowClues: Clues;
    colClues: Clues;
    status: NonogramStatus;
    difficulty: Difficulty;
    timer: number;
    errors: number;
    highScore: number;
    puzzleName: string;
    isRowComplete: (rowIndex: number) => boolean;
    isColComplete: (colIndex: number) => boolean;
    toggleCell: (row: number, col: number) => void;
    markCell: (row: number, col: number) => void;
    start: () => void;
    restart: () => void;
    changeDifficulty: (d: Difficulty) => void;
    nextPuzzle: () => void;
}
