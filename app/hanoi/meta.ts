/**
 * 汉诺塔游戏元数据
 *
 * @module hanoi/meta
 */

import { GameMeta } from '@/lib/types/registry';

export const hanoiMeta: GameMeta = {
    id: 'hanoi',
    name: '汉诺塔',
    description:
        '经典递归益智游戏。将所有圆盘从左边柱子移动到右边柱子，每次只能移动一个圆盘，且大圆盘不能放在小圆盘上。',
    icon: '🗼',
    tags: ['益智', '经典', '数学'],
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    iconBg: 'from-indigo-500/20 to-purple-500/20',
    glowColor: 'hover:shadow-purple-500/20',
};
