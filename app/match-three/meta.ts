import { GameMeta } from '@/lib/types/registry';

export const matchThreeMeta: GameMeta = {
  id: 'match-three',
  name: '消消乐',
  description: '交换相邻宝石，三个连线即可消除，触发连锁反应获得高分',
  icon: '💎',
  tags: ['益智', '消除', '休闲'],
  gradient: 'from-pink-500 via-rose-500 to-orange-500',
  iconBg: 'from-pink-500/20 to-orange-500/20',
  glowColor: 'hover:shadow-pink-500/20',
};
