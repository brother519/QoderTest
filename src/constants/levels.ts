import { Level } from '../types/game';

export const LEVELS: Level[] = [
  {
    id: 'easy',
    name: '初级',
    width: 8,
    height: 8,
    mines: 10
  },
  {
    id: 'medium',
    name: '中级',
    width: 16,
    height: 16,
    mines: 40
  },
  {
    id: 'hard',
    name: '高级',
    width: 16,
    height: 30,
    mines: 99
  }
];

export const LEVEL_MAP = Object.fromEntries(LEVELS.map(level => [level.id, level]));