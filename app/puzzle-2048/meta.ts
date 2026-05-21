/**
 * 2048 游戏元数据
 *
 * 在首页游戏中心展示卡片所需的注册信息。
 *
 * @module puzzle-2048/meta
 */

import { GameMeta } from '@/lib/types/registry';

/** 2048 游戏的注册元数据 */
export const puzzle2048Meta: GameMeta = {
  id: 'puzzle-2048',
  name: '2048',
  description:
    '经典数字合成益智游戏。使用方向键或滑动屏幕，把相同数字相加合并，最终合成 2048！考验规划与节奏感。',
  icon: '🔢',
  tags: ['益智', '数字'],
  gradient: 'from-amber-700 via-orange-600 to-yellow-700',
  iconBg: 'from-amber-500/20 to-yellow-500/20',
  glowColor: 'hover:shadow-amber-500/20',
};
