import { GameMeta } from '@/lib/types/registry';

export const nonogramMeta: GameMeta = {
    id: 'nonogram',
    name: '数织',
    description:
        '根据行列数字提示填充网格，推理出隐藏的像素画。左键填充、右键标记，完成所有正确格子即获胜。支持三级难度和多种图案。',
    icon: '🧩',
    tags: ['益智', '逻辑', '像素'],
    gradient: 'from-violet-800 via-purple-900 to-indigo-900',
    iconBg: 'from-purple-500/20 to-indigo-500/20',
    glowColor: 'hover:shadow-purple-500/20',
};
