/**
 * 一笔画游戏元数据
 *
 * 注册到全局 GAME_REGISTRY，首页读取展示。
 *
 * @module one-stroke/meta
 */

import { GameMeta } from '@/lib/types/registry';

export const oneStrokeMeta: GameMeta = {
    id: 'one-stroke',
    name: '一笔画',
    description: '用一笔经过所有边，每条边只能走一次，基于欧拉路径理论的经典益智游戏。',
    icon: '✏️',
    tags: ['益智', '逻辑', '图论'],
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-500/20',
    glowColor: 'rgba(245, 158, 11, 0.4)',
};
