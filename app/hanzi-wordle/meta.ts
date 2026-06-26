/**
 * Game metadata for Hanzi Wordle
 *
 * Registers the game in the global GAME_REGISTRY so it appears on the homepage.
 *
 * @module hanzi-wordle/meta
 */

import { GameMeta } from '@/lib/types/registry';

export const hanziWordleMeta: GameMeta = {
    id: 'hanzi-wordle',
    name: '汉字连连猜',
    description:
        '中文版 Wordle！6次机会猜出隐藏的4字成语。绿色=位置正确，黄色=字存在但位置错，灰色=不在词语中。考验词汇量与逻辑推理。',
    icon: '🀄',
    tags: ['益智', '文字', '逻辑'],
    gradient: 'from-indigo-700 via-purple-800 to-slate-900',
    iconBg: 'from-indigo-500/20 to-purple-500/20',
    glowColor: 'hover:shadow-indigo-500/20',
};
