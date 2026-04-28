/**
 * 大富翁游戏元数据
 */

import { GameMeta } from '@/lib/types/registry';

export const monopolyMeta: GameMeta = {
  id: 'monopoly',
  name: '大富翁',
  description:
    '经典策略棋盘游戏！买地产、收租金、建房子，让对手破产！支持2-4人本地轮流对战。',
  icon: '🎲',
  tags: ['策略', '多人', '经典'],
  gradient: 'from-yellow-600 via-amber-500 to-orange-600',
  iconBg: 'from-yellow-500/20 to-orange-500/20',
  glowColor: 'hover:shadow-yellow-500/20',
};
