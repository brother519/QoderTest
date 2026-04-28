/**
 * 贪吃蛇游戏元数据
 *
 * @module snake/meta
 */

import { GameMeta } from '@/lib/types/registry';

export const snakeMeta: GameMeta = {
  id: 'snake',
  name: '贪吃蛇',
  description:
    '控制蛇在场地中穿梭吃掉食物不断变长，避开墙壁和自身，挑战你的反应速度和策略规划。',
  icon: '🐍',
  tags: ['动作', '经典'],
  gradient: 'from-emerald-600 via-green-500 to-teal-600',
  iconBg: 'from-emerald-500/20 to-teal-500/20',
  glowColor: 'hover:shadow-emerald-500/20',
};
