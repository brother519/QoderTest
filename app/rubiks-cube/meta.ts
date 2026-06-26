/**
 * 魔方游戏元数据
 *
 * @module rubiks-cube/meta
 */

import { GameMeta } from '@/lib/types/registry';

export const rubiksCubeMeta: GameMeta = {
    id: 'rubiks-cube',
    name: '魔方',
    description:
        '经典 3x3 魔方益智挑战！点击按钮旋转各层，在空白处拖拽旋转视角，将六面颜色还原一致。',
    icon: '🧊',
    tags: ['益智', '经典', '3D'],
    gradient: 'from-indigo-600 via-violet-500 to-purple-600',
    iconBg: 'from-indigo-500/20 to-purple-500/20',
    glowColor: 'hover:shadow-purple-500/20',
};
