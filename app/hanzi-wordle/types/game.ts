/**
 * Type definitions for Hanzi Wordle game
 *
 * @module hanzi-wordle/types/game
 */

/** Status of a single tile after a guess is evaluated */
export type TileStatus = 'correct' | 'present' | 'absent' | 'empty' | 'active';

/** A completed guess row with characters and their evaluated statuses */
export interface Guess {
    chars: string[];
    statuses: TileStatus[];
}

/** Overall game status */
export type GameStatus = 'playing' | 'won' | 'lost';

/** State snapshot for the keyboard character status map */
export type KeyStatusMap = Record<string, TileStatus>;
