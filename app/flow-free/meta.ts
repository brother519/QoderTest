import { GameMeta } from '@/lib/types/registry';

export const flowFreeMeta: GameMeta = {
  id: 'flow-free',
  name: '连线游戏',
  description:
    '在网格中连接相同颜色的端点对，路径不可交叉且需填满整个棋盘。考验你的规划能力！',
  icon: '🔗',
  tags: ['益智', '逻辑', '路径'],
  gradient: 'from-violet-600 via-purple-500 to-fuchsia-600',
  iconBg: 'from-violet-500/20 to-fuchsia-500/20',
  glowColor: 'hover:shadow-purple-500/20',
};
