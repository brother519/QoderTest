/**
 * 滑动拼图游戏元数据
 *
 * @module sliding-puzzle/meta
 */

import { GameMeta } from '@/lib/types/registry';

export const slidingPuzzleMeta: GameMeta = {
    id: 'sliding-puzzle',
    name: '滑动拼图',
    description:
        '经典数字滑动拼图益智游戏。通过点击与空格相邻的方块，把 1-15 按顺序排列，挑战最少步数和最快时间。',
    icon: '🧩',
    tags: ['益智', '数字', '经典'],
    gradient: 'from-teal-600 via-emerald-500 to-green-600',
    iconBg: 'from-teal-500/20 to-green-500/20',
    glowColor: 'hover:shadow-emerald-500/20',
};
