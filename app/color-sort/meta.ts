import { GameMeta } from '@/lib/types/registry';

export const colorSortMeta: GameMeta = {
    id: 'color-sort',
    name: '颜色排序',
    description: '点击试管移动彩球，把相同颜色的球归入同一试管。步数越少越厉害！',
    icon: '🧪',
    tags: ['益智', '排序', '休闲'],
    gradient: 'from-violet-600 via-fuchsia-500 to-pink-500',
    iconBg: 'from-violet-500/20 to-fuchsia-500/20',
    glowColor: 'hover:shadow-violet-500/20',
};
