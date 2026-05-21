/**
 * 消消乐游戏常量配置
 *
 * @module app/match-three/constants/config
 */

import type { GameLevel, LevelConfig } from '@/app/match-three/types/game';

/** 宝石图标列表 */
export const GEM_ICONS: string[] = ['💎', '🔮', '🍀', '⭐', '🌙', '🔥', '💧'];

/** 难度关卡配置 */
export const LEVELS: Record<GameLevel, LevelConfig> = {
  easy: {
    id: 'easy',
    name: '简单',
    description: '6×6 棋盘，5种宝石，30步内达到1000分',
    icon: '🌱',
    targetScore: 1000,
    moves: 30,
    rows: 6,
    cols: 6,
    gemTypes: GEM_ICONS.slice(0, 5),
  },
  medium: {
    id: 'medium',
    name: '中等',
    description: '8×8 棋盘，6种宝石，25步内达到2000分',
    icon: '🌿',
    targetScore: 2000,
    moves: 25,
    rows: 8,
    cols: 8,
    gemTypes: GEM_ICONS.slice(0, 6),
  },
  hard: {
    id: 'hard',
    name: '困难',
    description: '8×8 棋盘，7种宝石，20步内达到3000分',
    icon: '🔥',
    targetScore: 3000,
    moves: 20,
    rows: 8,
    cols: 8,
    gemTypes: GEM_ICONS.slice(0, 7),
  },
};

/** 计分配置 */
export const SCORE_CONFIG = {
  /** 基础消除分数 */
  baseScore: 10,
  /** 连锁倍率 */
  cascadeMultiplier: 1.5,
  /** 每多一个宝石的额外奖励分 */
  matchBonusPerExtra: 5,
} as const;

/** 动画时长配置（毫秒） */
export const ANIMATION_CONFIG = {
  /** 交换动画时长 */
  swapDuration: 200,
  /** 消除动画时长 */
  removeDuration: 300,
  /** 下落动画时长 */
  dropDuration: 300,
} as const;
