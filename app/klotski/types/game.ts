/**
 * Klotski (华容道) game type definitions
 *
 * Defines the complete type system for the sliding block puzzle game.
 * The board is 4 columns wide and 5 rows tall.
 */

import { GridPosition } from '@/lib/types/game';

/** Block piece types - each has a fixed size on the grid */
export type BlockType = 'king' | 'general_h' | 'general_v' | 'soldier';

/** Game status lifecycle */
export type KlotskiStatus = 'selecting' | 'playing' | 'won';

/**
 * A single block piece on the board.
 * Position is defined by top-left corner (row, col).
 */
export interface Block {
    id: string;
    type: BlockType;
    row: number;
    col: number;
    width: number;
    height: number;
    label: string;
}

/** A puzzle level configuration */
export interface Level {
    id: string;
    name: string;
    description: string;
    blocks: Block[];
    parSteps: number;
}

/** Complete game state for the Klotski puzzle */
export interface KlotskiGameState {
    status: KlotskiStatus;
    blocks: Block[];
    steps: number;
    history: Block[][];
    selectedBlockId: string | null;
    currentLevelId: string | null;
}

export type { GridPosition };
