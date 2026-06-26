/**
 * 接水管游戏元数据
 *
 * @module pipe-puzzle/meta
 */

import { GameMeta } from '@/lib/types/registry';

export const pipePuzzleMeta: GameMeta = {
    id: 'pipe-puzzle',
    name: '接水管',
    description: '旋转管道方块，将水源连接到出口。考验你的空间推理和逻辑思维能力！',
    icon: '🔧',
    tags: ['益智', '逻辑'],
    gradient: 'from-sky-600 via-cyan-500 to-teal-600',
    iconBg: 'from-sky-500/20 to-cyan-500/20',
    glowColor: 'hover:shadow-cyan-500/20',
};
