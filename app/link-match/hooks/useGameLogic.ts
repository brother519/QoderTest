/**
 * 游戏核心逻辑 Hook
 *
 * 封装连连看游戏的棋盘管理和交互逻辑，包括：
 * - 棋盘初始化与重置
 * - 卡牌选择与匹配判定
 * - 连接路径动画管理
 * - 提示功能与死局检测
 *
 * 纯棋盘逻辑函数来自 utils/boardLogic.ts，本模块仅负责 React 状态管理。
 *
 * @module link-match/hooks/useGameLogic
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Card, ConnectionPath, GameConfig } from '../types/game';
import {
  Board,
  initBoard,
  findPath,
  findHintPair,
  hasAvailableMoves,
  reshuffleBoard,
} from '../utils/boardLogic';

export type { Board };

/** 待处理的匹配信息，用于延迟执行消除动画 */
interface PendingMatch {
  card1: Card;
  card2: Card;
}

/** useGameLogic Hook 的返回值类型 */
export interface UseGameLogicReturn {
  /** 当前棋盘状态 */
  board: Board;
  /** 当前选中的卡牌列表 */
  selectedCards: Card[];
  /** 当前显示的连接线路径 */
  connectionPath: ConnectionPath | null;
  /** 处理卡牌点击事件 */
  handleCardSelect: (card: Card) => void;
  /** 重置游戏，重新生成棋盘 */
  resetGame: () => void;
  /** 获取一对可消除的卡牌提示 */
  getHint: () => [Card, Card] | null;
  /** 检查是否还有可消除的卡牌对 */
  hasAvailableMoves: () => boolean;
  /** 重排棋盘上的未消除卡牌 */
  reshuffle: () => void;
}

/**
 * 游戏核心逻辑 Hook
 *
 * @param config - 游戏配置参数（行数、列数、图标集）
 * @param onMatch - 卡牌匹配成功时的回调
 * @param onMismatch - 卡牌匹配失败时的回调
 * @returns 棋盘状态与操作方法
 */
export function useGameLogic(
  config: GameConfig,
  onMatch: () => void,
  onMismatch: () => void
): UseGameLogicReturn {
  // 使用空棋盘初始化，避免 SSR/客户端随机结果不一致导致的 hydration 错误
  const [board, setBoard] = useState<Board>(() => 
    Array(config.rows + 2).fill(null).map(() => Array(config.cols + 2).fill(null))
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [connectionPath, setConnectionPath] = useState<ConnectionPath | null>(null);
  const [pendingMatch, setPendingMatch] = useState<PendingMatch | null>(null);

  // 使用 ref 记录当前配置，用于检测配置变化
  const configRef = useRef(config);

  // 客户端挂载后再初始化棋盘，配置变化时重新初始化
  useEffect(() => {
    const configChanged = 
      configRef.current.rows !== config.rows || 
      configRef.current.cols !== config.cols ||
      configRef.current.icons.length !== config.icons.length;
    
    if (!isInitialized || configChanged) {
      setBoard(initBoard(config));
      setIsInitialized(true);
      configRef.current = config;
    }
  }, [config, isInitialized]);

  // 使用 ref 存储最新的 board，避免在 useEffect 中依赖 board
  const boardRef = useRef(board);
  boardRef.current = board;

  /** 重置游戏：重新生成棋盘、清空选中状态和连接路径 */
  const resetGame = useCallback(() => {
    setBoard(initBoard(config));
    setSelectedCards([]);
    setConnectionPath(null);
  }, [config]);

  /**
   * 处理卡牌选择逻辑
   *
   * 1. 忽略已消除卡牌
   * 2. 无选中卡牌 -> 选中当前卡牌
   * 3. 点击同一张 -> 取消选中
   * 4. 图标相同且路径可达 -> 播放连接动画后消除，触发 onMatch
   * 5. 否则 -> 触发 onMismatch
   */
  const handleCardSelect = useCallback(
    (card: Card) => {
      if (card.matched) return;

      if (selectedCards.length === 0) {
        setSelectedCards([card]);
        return;
      }

      const firstCard = selectedCards[0];

      if (firstCard.id === card.id) {
        setSelectedCards([]);
        return;
      }

      if (firstCard.icon === card.icon) {
        const path = findPath(board, firstCard, card);
        if (path) {
          setConnectionPath(path);
          setPendingMatch({ card1: firstCard, card2: card });
        } else {
          onMismatch();
          setSelectedCards([]);
        }
      } else {
        onMismatch();
        setSelectedCards([]);
      }
    },
    [board, selectedCards, onMismatch]
  );

  /** 获取提示：查找棋盘上第一对可消除的卡牌 */
  const getHint = useCallback((): [Card, Card] | null => {
    return findHintPair(board);
  }, [board]);

  /** 检查当前棋盘是否还有可消除的卡牌对 */
  const checkHasAvailableMoves = useCallback((): boolean => {
    return hasAvailableMoves(board);
  }, [board]);

  /** 重排棋盘：将未消除的卡牌随机重新分配位置 */
  const reshuffle = useCallback(() => {
    setBoard((prevBoard) => reshuffleBoard(prevBoard));
  }, []);

  /** 延迟处理匹配消除：显示连接线动画 300ms 后标记卡牌为已消除 */
  useEffect(() => {
    if (!pendingMatch) return;

    const timer = setTimeout(() => {
      const { card1, card2 } = pendingMatch;

      setBoard((prevBoard) => {
        const newBoard = prevBoard.map((row) => [...row]);
        if (newBoard[card1.row][card1.col]) {
          newBoard[card1.row][card1.col]!.matched = true;
        }
        if (newBoard[card2.row][card2.col]) {
          newBoard[card2.row][card2.col]!.matched = true;
        }
        return newBoard;
      });
      setSelectedCards([]);
      setConnectionPath(null);
      setPendingMatch(null);
      onMatch();
    }, 300);

    return () => clearTimeout(timer);
  }, [pendingMatch, onMatch]);

  /** 自动检测死局：当棋盘没有可消除的卡牌对时自动重排 */
  useEffect(() => {
    if (!isInitialized) return;

    // 使用 setTimeout 避免在渲染过程中直接修改状态
    const timer = setTimeout(() => {
      if (!hasAvailableMoves(board)) {
        // 检查是否还有未消除的卡牌（游戏未结束）
        const hasUnmatchedCards = board.some((row) =>
          row.some((cell) => cell !== null && !cell.matched)
        );

        if (hasUnmatchedCards) {
          setBoard((prevBoard) => reshuffleBoard(prevBoard));
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [board, isInitialized]);

  return {
    board,
    selectedCards,
    connectionPath,
    handleCardSelect,
    resetGame,
    getHint,
    hasAvailableMoves: checkHasAvailableMoves,
    reshuffle,
  };
}
