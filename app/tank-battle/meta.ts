import { GameMeta } from '@/lib/types/registry';

export const tankBattleMeta: GameMeta = {
  id: 'tank-battle',
  name: '坦克大战',
  description:
    '经典坦克大战！操控你的坦克消灭所有敌军，保护基地不被摧毁。收集道具增强实力，挑战最高分！',
  icon: '🎖️',
  tags: ['射击', '经典'],
  gradient: 'from-amber-600 via-orange-500 to-red-600',
  iconBg: 'from-amber-500/20 to-red-500/20',
  glowColor: 'hover:shadow-orange-500/20',
};
