/**
 * 井字棋游戏元数据
 *
 * @module tic-tac-toe/meta
 */

import { GameMeta } from '@/lib/types/registry';

export const ticTacToeMeta: GameMeta = {
    id: 'tic-tac-toe',
    name: '井字棋',
    description:
        '经典双人对弈益智游戏。在 3x3 棋盘上轮流落子，率先连成一线者获胜。支持人机对战和双人对战两种模式。',
    icon: '⭕',
    tags: ['益智', '对弈', '经典'],
    gradient: 'from-slate-800 via-indigo-900 to-slate-900',
    iconBg: 'from-indigo-500/20 to-violet-500/20',
    glowColor: 'hover:shadow-indigo-500/20',
};
