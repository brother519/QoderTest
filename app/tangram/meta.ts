import { GameMeta } from '@/lib/types/registry';

export const tangramMeta: GameMeta = {
    id: 'tangram',
    name: '七巧板',
    description:
        '经典几何拼图游戏，拖拽、旋转、翻转七块几何板拼出目标图形。支持 6 个由易到难的关卡，考验空间想象力。',
    icon: '🔷',
    tags: ['益智', '拼图', '几何'],
    gradient: 'from-cyan-800 via-teal-900 to-emerald-900',
    iconBg: 'from-cyan-500/20 to-teal-500/20',
    glowColor: 'hover:shadow-cyan-500/20',
};
