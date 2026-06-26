import { GameMeta } from '@/lib/types/registry';

export const hanziRiddleMeta: GameMeta = {
    id: 'hanzi-riddle',
    name: '汉字猜谜',
    description:
        '根据逐步揭示的线索猜出隐藏汉字！偏旁、笔画、含义、拼音——线索越少分数越高，考验你的汉字功底。',
    icon: '🏮',
    tags: ['文字', '益智', '知识'],
    gradient: 'from-amber-800 via-orange-900 to-slate-900',
    iconBg: 'from-amber-500/20 to-orange-500/20',
    glowColor: 'hover:shadow-amber-500/20',
};
