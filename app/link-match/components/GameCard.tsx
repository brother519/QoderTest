'use client';

/**
 * 游戏卡牌组件
 *
 * 渲染棋盘上的单张卡牌，根据状态展示不同的视觉效果：
 * - 默认状态：白色背景，灰色边框
 * - 选中状态：蓝色高亮，放大效果
 * - 提示状态：黄色高亮，脉冲动画
 * - 已消除状态：透明隐藏，保留占位空间
 *
 * @module link-match/components/GameCard
 */

import { Card } from '../types/game';

/**
 * GameCard 组件的 Props 类型
 *
 * @property {Card} card - 卡牌数据，包含图标、位置和匹配状态
 * @property {boolean} isSelected - 该卡牌是否被玩家选中
 * @property {boolean} isHinted - 该卡牌是否正在被提示高亮
 * @property {() => void} onClick - 卡牌点击事件回调
 */
interface GameCardProps {
  card: Card;
  isSelected: boolean;
  isHinted: boolean;
  onClick: () => void;
}

/**
 * 游戏卡牌组件
 *
 * 单张卡牌的可交互按钮组件，支持无障碍访问（aria 属性）。
 * 已消除的卡牌渲染为不可见的占位 div，确保棋盘布局不会塌陷。
 *
 * @param {GameCardProps} props - 组件属性
 * @returns {JSX.Element} 卡牌按钮或占位元素
 */
export function GameCard({ card, isSelected, isHinted, onClick }: GameCardProps) {
  // 已消除的卡牌：渲染透明占位 div，保持网格布局稳定
  if (card.matched) {
    return (
      <div
        className="w-14 h-14 rounded-lg opacity-0 scale-75 transition-all duration-300"
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      onClick={onClick}
      className={`
        w-14 h-14 rounded-lg flex items-center justify-center
        text-2xl select-none cursor-pointer
        transition-all duration-150 ease-out
        hover:scale-105 hover:shadow-md
        active:scale-95
        ${
          isSelected
            ? 'bg-blue-100 border-2 border-blue-500 shadow-blue-200 shadow-lg scale-105'
            : isHinted
            ? 'bg-yellow-100 border-2 border-yellow-400 shadow-yellow-200 shadow-lg animate-pulse'
            : 'bg-white border-2 border-gray-200 hover:border-gray-300'
        }
      `}
      aria-label={`卡牌 ${card.icon}`}
      aria-pressed={isSelected}
    >
      <span className="pointer-events-none">{card.icon}</span>
    </button>
  );
}
