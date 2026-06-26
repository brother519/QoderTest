/**
 * Maze game metadata
 *
 * @module maze/meta
 */

import { GameMeta } from '@/lib/types/registry';

export const mazeMeta: GameMeta = {
    id: 'maze',
    name: '迷宫',
    description: '经典迷宫益智游戏。使用方向键控制角色穿越随机生成的迷宫，找到通往出口的路径。',
    icon: '🏁',
    tags: ['益智', '经典', '探索'],
    gradient: 'from-emerald-600 via-teal-500 to-cyan-600',
    iconBg: 'from-emerald-500/20 to-cyan-500/20',
    glowColor: 'hover:shadow-emerald-500/20',
};
