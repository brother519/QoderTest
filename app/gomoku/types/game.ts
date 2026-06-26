export type Stone = 'black' | 'white' | null;
export type Player = 'black' | 'white';
export type GomokuStatus = 'idle' | 'playing' | 'won' | 'draw';

export interface BoardConfig {
    boardSize: number;
    winLength: number;
    cellSize: number;
}

export interface MoveRecord {
    row: number;
    col: number;
    player: Player;
}
