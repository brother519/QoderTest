/**
 * 打地鼠游戏元数据
 *
 * @module whack-a-mole/meta
 */

import { GameMeta } from '@/lib/types/registry';

export const whackAMoleMeta: GameMeta = {
  id: 'whack-a-mole',
  name: '打地鼠',
  description:
    '地鼠随机从洞中钻出，快速点击敲击它们！注意躲避炸弹，捕捉金色地鼠获得高分，连击可获得额外奖励。',
  icon: '🔨',
  tags: ['反应', '休闲'],
  gradient: 'from-amber-600 via-orange-500 to-yellow-600',
  iconBg: 'from-amber-500/20 to-orange-500/20',
  glowColor: 'hover:shadow-amber-500/20',
};
