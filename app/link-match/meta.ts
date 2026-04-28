/**
 * 连连看游戏元数据
 *
 * @module link-match/meta
 */

import { GameMeta } from '@/lib/types/registry';

export const linkMatchMeta: GameMeta = {
  id: 'link-match',
  name: '连连看',
  description:
    '经典益智消除游戏，找出相同图案并用最少转弯的路径连接它们，考验你的观察力和空间思维能力。',
  icon: '🎴',
  tags: ['益智', '消除'],
  gradient: 'from-violet-600 via-purple-500 to-indigo-600',
  iconBg: 'from-violet-500/20 to-indigo-500/20',
  glowColor: 'hover:shadow-purple-500/20',
};
