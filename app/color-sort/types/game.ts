export type GameStatus = 'idle' | 'playing' | 'won';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameConfig {
    numColors: number;
    ballsPerTube: number;
    extraTubes: number;
}

export interface TubeState {
    balls: string[];
    capacity: number;
}

export interface BestRecord {
    moves: number | null;
    time: number | null;
}
