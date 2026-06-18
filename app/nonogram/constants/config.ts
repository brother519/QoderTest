import type { Difficulty } from '../types/game';

export interface DifficultyConfig {
    size: number;
    cellSize: number;
    label: string;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
    easy: { size: 5, cellSize: 48, label: '简单 5×5' },
    medium: { size: 10, cellSize: 36, label: '中等 10×10' },
    hard: { size: 15, cellSize: 28, label: '困难 15×15' },
};

export const CELL_COLORS = {
    empty: 'bg-gray-100 dark:bg-gray-700',
    filled: 'bg-indigo-500 dark:bg-indigo-400',
    marked: 'bg-gray-200 dark:bg-gray-600',
} as const;
