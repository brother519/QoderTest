/**
 * 扫雷游戏元数据
 *
 * @module minesweeper/meta
 */

import { GameMeta } from '@/lib/types/registry';

export const minesweeperMeta: GameMeta = {
  id: 'minesweeper',
  name: '扫雷',
  description:
    '在安全的第一步之后，利用数字线索标记地雷、层层推进，在最短时间内清空全部安全格子。',
  icon: '💣',
  tags: ['益智', '经典'],
  gradient: 'from-sky-500 via-cyan-400 to-emerald-400',
  iconBg: 'from-sky-500/20 to-emerald-400/20',
  glowColor: 'hover:shadow-cyan-400/20',
};
