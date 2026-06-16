import { BlockSize, BlockType } from '../types/game';

export const BOARD_COLS = 4;
export const BOARD_ROWS = 5;

export const EXIT_ROW = 3;
export const EXIT_COL = 1;
export const EXIT_WIDTH = 2;
export const EXIT_HEIGHT = 2;

export const BLOCK_SIZES: Record<BlockType, BlockSize> = {
  caocao: { width: 2, height: 2 },
  guanyu: { width: 2, height: 1 },
  vertical: { width: 1, height: 2 },
  soldier: { width: 1, height: 1 },
};

export const BLOCK_STYLES: Record<BlockType, string> = {
  caocao: 'bg-red-700 border-red-900 text-yellow-100',
  guanyu: 'bg-emerald-700 border-emerald-900 text-emerald-100',
  vertical: 'bg-blue-700 border-blue-900 text-blue-100',
  soldier: 'bg-amber-600 border-amber-800 text-amber-100',
};

export const MOVE_DURATION = 200;

export const BEST_STEPS_PREFIX = 'klotski-best-';
