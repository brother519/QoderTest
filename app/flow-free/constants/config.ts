import { DifficultyConfig } from '../types/game';

// Color palette for flows (visually distinct colors)
export const FLOW_COLORS: string[] = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#a855f7', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
];

// Difficulty configurations
export const DIFFICULTY_CONFIG: Record<string, DifficultyConfig> = {
  easy: { size: 5, numColors: 4, label: '简单' },
  medium: { size: 7, numColors: 6, label: '中等' },
  hard: { size: 9, numColors: 8, label: '困难' },
};

// Get difficulty based on level
export function getDifficultyForLevel(level: number): DifficultyConfig {
  if (level <= 3) return DIFFICULTY_CONFIG.easy;
  if (level <= 6) return DIFFICULTY_CONFIG.medium;
  return DIFFICULTY_CONFIG.hard;
}

// Scoring
export const BASE_LEVEL_SCORE = 100;
export const CLEAR_PENALTY = 5;
export const TIME_BONUS_THRESHOLD = 30; // seconds
export const TIME_BONUS_POINTS = 50;

// UI
export const CELL_SIZE = 50;
export const ENDPOINT_RADIUS = 0.35;
export const PATH_WIDTH = 0.4;
