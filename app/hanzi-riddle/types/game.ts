import { GameStatus } from '@/lib/types/game';

export type RiddleGameStatus = Extract<GameStatus, 'playing' | 'won' | 'lost'>;

export type ClueType =
    | 'radical'
    | 'strokeCount'
    | 'meaningHint'
    | 'pinyinInitial'
    | 'fullPinyin';

export interface ClueState {
    type: ClueType;
    label: string;
    value: string;
    revealed: boolean;
}

export interface CharacterEntry {
    character: string;
    radical: string;
    strokeCount: number;
    meaningHint: string;
    pinyinInitial: string;
    fullPinyin: string;
}

export interface RoundResult {
    won: boolean;
    character: string;
    cluesRemaining: number;
    points: number;
}
