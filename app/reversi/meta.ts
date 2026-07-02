import { GameMeta } from '@/lib/types/registry';

export const reversiMeta: GameMeta = {
    id: 'reversi',
    name: '黑白棋',
    description: '经典 8×8 翻转棋，夹住对方即可翻子，终局子多者胜',
    icon: '⚫⚪',
    tags: ['策略', '对弈'],
    gradient: 'from-emerald-700 via-green-600 to-teal-600',
    iconBg: 'from-emerald-500/20 to-teal-500/20',
    glowColor: 'hover:shadow-emerald-500/20',
};
