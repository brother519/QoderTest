import { Difficulty, GameConfig } from '../types/game';

export const DIFFICULTY_CONFIGS: Record<Difficulty, GameConfig> = {
    easy: { numColors: 5, ballsPerTube: 4, extraTubes: 2 },
    medium: { numColors: 7, ballsPerTube: 4, extraTubes: 2 },
    hard: { numColors: 10, ballsPerTube: 4, extraTubes: 2 },
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
};

export const COLOR_PALETTE: Record<string, { bg: string; glow: string }> = {
    red: { bg: 'bg-red-500', glow: 'shadow-red-500/50' },
    orange: { bg: 'bg-orange-500', glow: 'shadow-orange-500/50' },
    amber: { bg: 'bg-amber-400', glow: 'shadow-amber-400/50' },
    green: { bg: 'bg-green-500', glow: 'shadow-green-500/50' },
    teal: { bg: 'bg-teal-500', glow: 'shadow-teal-500/50' },
    cyan: { bg: 'bg-cyan-500', glow: 'shadow-cyan-500/50' },
    blue: { bg: 'bg-blue-500', glow: 'shadow-blue-500/50' },
    indigo: { bg: 'bg-indigo-500', glow: 'shadow-indigo-500/50' },
    violet: { bg: 'bg-violet-500', glow: 'shadow-violet-500/50' },
    pink: { bg: 'bg-pink-500', glow: 'shadow-pink-500/50' },
};

export const COLOR_KEYS = Object.keys(COLOR_PALETTE);

export const BEST_RECORD_KEY_PREFIX = 'color-sort-best-';

export const SHUFFLE_MOVES = 80;

export const TUBE_WIDTH = 52;
export const TUBE_HEIGHT = 200;
export const BALL_SIZE = 40;
export const BALL_GAP = 4;
export const TUBE_GAP = 12;
export const BALL_BOTTOM_PADDING = 8;

export const MOVE_ANIMATION_DURATION = 200;
