/**
 * 滑动拼图游戏配置常量
 *
 * @module sliding-puzzle/constants/config
 */

import { GameConfig } from '../types/game';

/** 默认游戏配置 */
export const DEFAULT_CONFIG: GameConfig = {
    size: 4,
    moveDuration: 150,
};

/** localStorage 最佳记录 key */
export const BEST_RECORD_KEY = 'sliding-puzzle-best-record';

/** 洗牌步数（从完成状态模拟随机移动） */
export const SHUFFLE_MOVES = 200;

/** 不同数值方块对应的 Tailwind 颜色 */
export const TILE_STYLES: Record<number, string> = {
    1: 'bg-emerald-500 text-white',
    2: 'bg-teal-500 text-white',
    3: 'bg-cyan-500 text-white',
    4: 'bg-sky-500 text-white',
    5: 'bg-blue-500 text-white',
    6: 'bg-indigo-500 text-white',
    7: 'bg-violet-500 text-white',
    8: 'bg-purple-500 text-white',
    9: 'bg-fuchsia-500 text-white',
    10: 'bg-pink-500 text-white',
    11: 'bg-rose-500 text-white',
    12: 'bg-orange-500 text-white',
    13: 'bg-amber-500 text-white',
    14: 'bg-yellow-500 text-white',
    15: 'bg-lime-500 text-white',
};

/** 兜底样式 */
export const TILE_STYLE_FALLBACK = 'bg-slate-600 text-white';
