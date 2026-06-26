/**
 * 猜数字游戏元数据
 *
 * @module guess-number/meta
 */

import { GameMeta } from '@/lib/types/registry';

export const guessNumberMeta: GameMeta = {
    id: 'guess-number',
    name: '猜数字',
    description:
        '经典 Bulls & Cows 猜数字益智游戏。猜出隐藏的不重复数字密码，每次获得几A几B提示，用最少次数破解！',
    icon: '🔢',
    tags: ['益智', '逻辑', '经典'],
    gradient: 'from-emerald-800 via-teal-900 to-slate-900',
    iconBg: 'from-emerald-500/20 to-teal-500/20',
    glowColor: 'hover:shadow-emerald-500/20',
};
