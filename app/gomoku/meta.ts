import { GameMeta } from '@/lib/types/registry';

export const gomokuMeta: GameMeta = {
    id: 'gomoku',
    name: '五子棋',
    description: '经典双人对弈策略游戏，先连成五子者获胜',
    icon: '⚫',
    tags: ['策略', '对弈'],
    gradient: 'from-amber-600 via-yellow-500 to-orange-600',
    iconBg: 'from-amber-500/20 to-orange-500/20',
    glowColor: 'hover:shadow-amber-500/20',
};
