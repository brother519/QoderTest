/**
 * 俄罗斯方块游戏元数据
 *
 * @module tetris/meta
 */

import { GameMeta } from '@/lib/types/registry';

export const tetrisMeta: GameMeta = {
  id: 'tetris',
  name: '俄罗斯方块',
  description:
    '旋转并放置不断下落的方块，巧妙填满整行进行消除得分，在速度与策略间寻找平衡。',
  icon: '🧱',
  tags: ['策略', '经典'],
  gradient: 'from-cyan-600 via-blue-500 to-indigo-600',
  iconBg: 'from-cyan-500/20 to-blue-500/20',
  glowColor: 'hover:shadow-cyan-500/20',
};
