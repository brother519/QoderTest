/**
 * 推箱子游戏元数据
 *
 * @module sokoban/meta
 */

import { GameMeta } from '@/lib/types/registry';

export const sokobanMeta: GameMeta = {
    id: 'sokoban',
    name: '推箱子',
    description:
        '经典推箱子益智游戏。把箱子推到目标位置即可过关，小心别把自己堵死！12 个精心设计的关卡，难度递增。',
    icon: '📦',
    tags: ['益智', '策略'],
    gradient: 'from-amber-800 via-yellow-700 to-orange-800',
    iconBg: 'from-amber-500/20 to-orange-500/20',
    glowColor: 'hover:shadow-amber-500/20',
};
