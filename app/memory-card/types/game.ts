export type GameStatus = 'idle' | 'playing' | 'won';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameConfig {
    pairs: number;
    cols: number;
}

export interface CardItem {
    id: number;
    emoji: string;
    flipped: boolean;
    matched: boolean;
}

export interface BestRecord {
    moves: number | null;
    time: number | null;
}
