/**
 * 打地鼠游戏配置常量
 *
 * @module whack-a-mole/constants/config
 */

import { GameConfig } from '../types/game';

/** 默认游戏配置 */
export const DEFAULT_CONFIG: GameConfig = {
  rows: 3,
  cols: 3,
  gameDuration: 60,
  baseMoleInterval: 1200,
  minMoleInterval: 500,
  moleStayDuration: 1200,
  minMoleStayDuration: 500,
  speedStep: 80,
  speedThreshold: 10,
  goldenMoleChance: 0.12,
  bombMoleChance: 0.1,
  riseDuration: 200,
  fallDuration: 200,
  hitEffectDuration: 400,
};

/** 普通地鼠得分 */
export const SCORE_NORMAL = 10;

/** 金色地鼠得分 */
export const SCORE_GOLDEN = 25;

/** 炸弹地鼠扣分 */
export const SCORE_BOMB = -15;

/** 连击奖励开始阈值 */
export const COMBO_THRESHOLD = 3;

/** 每级连击额外奖励 */
export const COMBO_BONUS = 5;

/** 最大同时出现的地鼠数 */
export const MAX_ACTIVE_MOLES = 4;

/** 连击倍率显示映射 */
export const COMBO_MULTIPLIERS: Record<number, string> = {
  3: 'x1.5',
  5: 'x2',
  8: 'x3',
  12: 'x5',
};
