/**
 * Klotski game constants and configuration
 *
 * Board dimensions, visual styling, and game parameters.
 */

import { BlockType } from '../types/game';

// Board grid dimensions
export const BOARD_COLS = 4;
export const BOARD_ROWS = 5;

// Exit position - where the king (2x2) must reach to win
export const EXIT_ROW = 3;
export const EXIT_COL = 1;

// Rendering dimensions (pixels)
export const CELL_SIZE = 80;
export const GAP = 4;

// Animation timing
export const MOVE_DURATION = 150;

// LocalStorage key prefix for best scores
export const BEST_STEPS_KEY = 'klotski-best-';

/**
 * Block color scheme using ancient Chinese ink-painting aesthetic.
 * Each block type has tailwind classes for bg, border, text, and shadow.
 */
export const BLOCK_COLORS: Record<
    BlockType,
    { bg: string; border: string; text: string; shadow: string }
> = {
    king: {
        bg: 'bg-red-800',
        border: 'border-yellow-600',
        text: 'text-yellow-100',
        shadow: 'shadow-red-900/60',
    },
    general_h: {
        bg: 'bg-emerald-700',
        border: 'border-emerald-400',
        text: 'text-emerald-50',
        shadow: 'shadow-emerald-900/50',
    },
    general_v: {
        bg: 'bg-indigo-800',
        border: 'border-indigo-400',
        text: 'text-indigo-50',
        shadow: 'shadow-indigo-900/50',
    },
    soldier: {
        bg: 'bg-amber-700',
        border: 'border-amber-500',
        text: 'text-amber-50',
        shadow: 'shadow-amber-900/50',
    },
};
