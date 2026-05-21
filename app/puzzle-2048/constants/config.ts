/**
 * 2048 游戏配置常量
 *
 * @module puzzle-2048/constants/config
 */

import { GameConfig } from '../types/game';

/** 默认游戏配置 */
export const DEFAULT_CONFIG: GameConfig = {
  size: 4,
  winValue: 2048,
  fourChance: 0.1,
  moveDuration: 150,
};

/** localStorage 中保存最高分的 key */
export const HIGH_SCORE_KEY = 'puzzle2048HighScore';

/**
 * 不同数值方块对应的 Tailwind 颜色样式映射
 * key 为方块数值，value 为 Tailwind class 字符串（背景 + 文字色）
 */
export const TILE_STYLES: Record<number, string> = {
  2:    'bg-amber-100 text-amber-900',
  4:    'bg-amber-200 text-amber-900',
  8:    'bg-orange-300 text-white',
  16:   'bg-orange-400 text-white',
  32:   'bg-orange-500 text-white',
  64:   'bg-red-500 text-white',
  128:  'bg-yellow-400 text-white',
  256:  'bg-yellow-500 text-white',
  512:  'bg-yellow-600 text-white',
  1024: 'bg-emerald-500 text-white',
  2048: 'bg-emerald-600 text-white',
  4096: 'bg-indigo-600 text-white',
  8192: 'bg-purple-600 text-white',
};

/** 大于映射表中最大键时使用的兜底样式 */
export const TILE_STYLE_FALLBACK = 'bg-slate-800 text-white';

/**
 * 不同数值方块的字号样式
 * 数值位数越多字号越小，避免溢出
 */
export const TILE_FONT_SIZE: Record<number, string> = {
  1: 'text-4xl', // 个位数
  2: 'text-3xl', // 十位
  3: 'text-2xl', // 百位
  4: 'text-xl',  // 千位
  5: 'text-lg',  // 万位及以上
};
