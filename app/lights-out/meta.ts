/**
 * 点灯游戏元数据
 *
 * @module lights-out/meta
 */

import { GameMeta } from '@/lib/types/registry';

export const lightsOutMeta: GameMeta = {
    id: 'lights-out',
    name: '点灯游戏',
    description:
        '经典益智游戏。点击格子会切换它和相邻格子的灯光状态，目标是把所有灯熄灭。10 个关卡，从 3x3 到 5x5 递进。',
    icon: '💡',
    tags: ['益智', '逻辑'],
    gradient: 'from-slate-800 via-yellow-900 to-slate-900',
    iconBg: 'from-yellow-500/20 to-amber-500/20',
    glowColor: 'hover:shadow-yellow-500/20',
};
