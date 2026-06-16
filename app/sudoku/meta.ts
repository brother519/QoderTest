/**
 * 数独游戏元数据
 *
 * @module sudoku/meta
 */

import { GameMeta } from '@/lib/types/registry';

export const sudokuMeta: GameMeta = {
    id: 'sudoku',
    name: '数独',
    description:
        '经典数字逻辑游戏。在 9x9 网格中填入 1-9，使每行、每列和每个 3x3 宫格都包含全部数字。支持笔记模式和三级难度。',
    icon: '🔢',
    tags: ['益智', '逻辑', '数字'],
    gradient: 'from-slate-800 via-indigo-900 to-slate-900',
    iconBg: 'from-indigo-500/20 to-violet-500/20',
    glowColor: 'hover:shadow-indigo-500/20',
};
