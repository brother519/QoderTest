/**
 * 打地鼠游戏元数据
 *
 * 定义游戏在首页游戏中心卡片中的展示信息，
 * 包括路由 ID、名称、描述、图标、标签和样式配置。
 * 通过 GAME_REGISTRY 注册后，首页会自动渲染对应的游戏卡片。
 *
 * @module whack-a-mole/meta
 */

import { GameMeta } from '@/lib/types/registry';

/** 打地鼠游戏的注册元数据 */
export const whackAMoleMeta: GameMeta = {
  id: 'whack-a-mole', // 路由路径，对应 /whack-a-mole
  name: '打地鼠', // 游戏显示名称
  description:
    '地鼠随机从洞中钻出，快速点击敲击它们！注意躲避炸弹，捕捉金色地鼠获得高分，连击可获得额外奖励。',
  icon: '🔨', // 游戏卡片图标
  tags: ['反应', '休闲'], // 游戏分类标签
  gradient: 'from-amber-600 via-orange-500 to-yellow-600', // 卡片背景渐变色
  iconBg: 'from-amber-500/20 to-orange-500/20', // 图标背景渐变色
  glowColor: 'hover:shadow-amber-500/20', // 悬浮发光颜色
};
