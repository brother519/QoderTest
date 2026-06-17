import { Difficulty, GameConfig } from '../types/game';

export const DIFFICULTY_CONFIGS: Record<Difficulty, GameConfig> = {
    easy: { pairs: 6, cols: 4 },
    medium: { pairs: 8, cols: 4 },
    hard: { pairs: 10, cols: 5 },
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
};

export const EMOJI_POOL = [
    '🍎', '🍊', '🍋', '🍇', '🍓',
    '🍒', '🥝', '🍑', '🫐', '🍌',
    '🥭', '🍈',
];

export const CARD_SIZE = 80;
export const CARD_GAP = 8;
export const FLIP_DELAY = 800;
export const BEST_RECORD_KEY_PREFIX = 'memory-card-best-';
