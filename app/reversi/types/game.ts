export type Disc = 'black' | 'white' | null;
export type Player = 'black' | 'white';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ReversiStatus = 'idle' | 'playing' | 'won' | 'draw';
export type GameMode = 'pvp' | 'pve';

export interface BoardConfig {
    boardSize: number;
    cellSize: number;
}

export interface Cell {
    row: number;
    col: number;
}

export interface MoveRecord extends Cell {
    player: Player;
    flipped: Cell[];
}

export interface Score {
    black: number;
    white: number;
}
