'use client';

/**
 * 游戏棋盘组件
 *
 * 渲染整个连连看棋盘区域，包括：
 * - 卡牌网格：使用 CSS Grid 布局展示所有卡牌
 * - 连接线层：绝对定位覆盖在卡牌网格上方，用于展示匹配成功的连接动画
 *
 * 棋盘数据结构为 (rows+2) x (cols+2) 的二维数组，外围一圈为 null（空位边界），
 * 本组件只渲染内部 rows x cols 区域的卡牌。
 *
 * @module link-match/components/GameBoard
 */

import { Card, ConnectionPath } from '../types/game';
import { Board } from '../hooks/useGameLogic';
import { GameCard } from './GameCard';
import { ConnectionLine } from './ConnectionLine';
import { GAME_CONFIG } from '../constants/config';

/**
 * GameBoard 组件的 Props 类型
 *
 * @property {Board} board - 当前棋盘数据（含外围边界）
 * @property {Card[]} selectedCards - 当前玩家选中的卡牌列表
 * @property {ConnectionPath | null} connectionPath - 当前正在显示的连接路径
 * @property {Card[]} hintedCards - 当前被提示高亮的卡牌列表
 * @property {(card: Card) => void} onCardSelect - 卡牌点击事件回调
 */
interface GameBoardProps {
  board: Board;
  selectedCards: Card[];
  connectionPath: ConnectionPath | null;
  hintedCards: Card[];
  onCardSelect: (card: Card) => void;
}

/**
 * 游戏棋盘组件
 *
 * 负责将棋盘数据渲染为可交互的卡牌网格，并在匹配成功时叠加连接线动画。
 * 使用毛玻璃背景和圆角阴影提供视觉层次感。
 *
 * @param {GameBoardProps} props - 组件属性
 * @returns {JSX.Element} 棋盘区域
 */
export function GameBoard({
  board,
  selectedCards,
  connectionPath,
  hintedCards,
  onCardSelect,
}: GameBoardProps) {
  // 计算内部游戏区域的行列数（排除外围一圈边界）
  const innerRows = board.length - 2;
  const innerCols = board[0]?.length - 2 || 0;

  /**
   * 判断卡牌是否处于选中状态
   * @param {Card} card - 目标卡牌
   * @returns {boolean} 是否被选中
   */
  const isCardSelected = (card: Card): boolean => {
    return selectedCards.some((c) => c.id === card.id);
  };

  /**
   * 判断卡牌是否处于提示高亮状态
   * @param {Card} card - 目标卡牌
   * @returns {boolean} 是否被提示高亮
   */
  const isCardHinted = (card: Card): boolean => {
    return hintedCards.some((c) => c.id === card.id);
  };

  /**
   * 渲染内部游戏区域
   *
   * 遍历棋盘内部区域（[1..innerRows][1..innerCols]），为每个位置渲染：
   * - 有卡牌：渲染 GameCard 组件
   * - 无卡牌（null）：渲染空占位 div 以维持网格布局
   *
   * @returns {JSX.Element[]} 卡牌和占位元素数组
   */
  const renderGameArea = () => {
    const cards: JSX.Element[] = [];

    for (let row = 1; row <= innerRows; row++) {
      for (let col = 1; col <= innerCols; col++) {
        const card = board[row][col];
        if (card) {
          cards.push(
            <GameCard
              key={card.id}
              card={card}
              isSelected={isCardSelected(card)}
              isHinted={isCardHinted(card)}
              onClick={() => onCardSelect(card)}
            />
          );
        } else {
          // 空位占位，保持网格完整性
          cards.push(
            <div
              key={`empty-${row}-${col}`}
              className="w-14 h-14"
              aria-hidden="true"
            />
          );
        }
      }
    }

    return cards;
  };

  return (
    <div className="relative inline-block">
      {/* 棋盘容器：毛玻璃背景 + 圆角阴影 */}
      <div
        className="relative bg-white/50 backdrop-blur-sm rounded-xl p-4 shadow-lg"
        style={{
          display: 'inline-block',
        }}
      >
        {/* 卡牌区域容器：相对定位，用于连接线定位参考 */}
        <div className="relative">
          {/* 连接线层：绝对定位叠加在卡牌网格上方 */}
          <ConnectionLine
            path={connectionPath}
            cardSize={GAME_CONFIG.cardSize}
            cardGap={GAME_CONFIG.cardGap}
          />

          {/* 卡牌网格：CSS Grid 布局 */}
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${innerCols}, minmax(0, 1fr))`,
            }}
          >
            {renderGameArea()}
          </div>
        </div>
      </div>
    </div>
  );
}
