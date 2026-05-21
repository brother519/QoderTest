/**
 * 消消乐主游戏逻辑 Hook
 *
 * 管理棋盘状态、选择交换、消除循环、动画时序和死局检测。
 *
 * @module app/match-three/hooks/useMatchThreeGame
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

import type { Board, LevelConfig, MatchResult } from '../types/game';

import {
  initBoard,
  findMatches,
  removeMatches,
  applyGravity,
  fillEmptySpaces,
  swapGems,
  isValidSwap,
  hasAvailableMoves,
  reshuffleBoard,
} from '../utils/boardLogic';

import { ANIMATION_CONFIG } from '../constants/config';

export interface UseMatchThreeGameReturn {
  board: Board;
  selectedGem: { row: number; col: number } | null;
  isAnimating: boolean;
  matchedPositions: Set<string>;
  cascadeCount: number;
  handleGemClick: (row: number, col: number) => void;
  resetGame: (config: LevelConfig) => void;
}

export function useMatchThreeGame(
  config: LevelConfig,
  onMatch: (matches: MatchResult[], cascadeLevel: number) => void,
  onMoveMade: () => void,
): UseMatchThreeGameReturn {
  const [board, setBoard] = useState<Board>([]);
  const [selectedGem, setSelectedGem] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [matchedPositions, setMatchedPositions] = useState<Set<string>>(
    new Set(),
  );
  const [cascadeCount, setCascadeCount] = useState(0);

  // 用 ref 保存最新 config，供 resetGame 和 effect 使用
  const configRef = useRef(config);
  configRef.current = config;

  // 保存回调和动画状态的 ref，避免闭包陷阱
  const onMatchRef = useRef(onMatch);
  onMatchRef.current = onMatch;
  const onMoveMadeRef = useRef(onMoveMade);
  onMoveMadeRef.current = onMoveMade;
  const isAnimatingRef = useRef(false);

  // Hydration 安全：在 useEffect 中初始化棋盘
  useEffect(() => {
    setBoard(initBoard(configRef.current));
  }, []);

  /** 将 matches 转为 "row-col" 集合 */
  function positionsToSet(matches: MatchResult[]): Set<string> {
    const set = new Set<string>();
    for (const match of matches) {
      for (const pos of match.positions) {
        set.add(`${pos.row}-${pos.col}`);
      }
    }
    return set;
  }

  /** 消除循环：交换后的完整 match → remove → gravity → fill → 连锁 */
  const processCascade = useCallback(
    (currentBoard: Board, currentCascade: number) => {
      const matches = findMatches(currentBoard);

      if (matches.length === 0) {
        // 连锁结束
        setIsAnimating(false);
        isAnimatingRef.current = false;
        setMatchedPositions(new Set());
        setCascadeCount(0);

        // 死局检测
        if (!hasAvailableMoves(currentBoard, configRef.current.gemTypes)) {
          const reshuffled = reshuffleBoard(
            currentBoard,
            configRef.current.gemTypes,
          );
          setBoard(reshuffled);
        }
        return;
      }

      // 通知分数计算
      onMatchRef.current(matches, currentCascade);
      setCascadeCount(currentCascade);

      // 标记消除位置
      const posSet = positionsToSet(matches);
      setMatchedPositions(posSet);

      // 等待消除动画
      setTimeout(() => {
        const afterRemove = removeMatches(currentBoard, matches);
        const afterGravity = applyGravity(afterRemove);
        const afterFill = fillEmptySpaces(
          afterGravity,
          configRef.current.gemTypes,
        );

        setBoard(afterFill);
        setMatchedPositions(new Set());

        // 等待下落动画后继续连锁
        setTimeout(() => {
          processCascade(afterFill, currentCascade + 1);
        }, ANIMATION_CONFIG.dropDuration);
      }, ANIMATION_CONFIG.removeDuration);
    },
    [],
  );

  /** 处理宝石点击 */
  const handleGemClick = useCallback(
    (row: number, col: number) => {
      if (isAnimatingRef.current) return;
      if (board.length === 0) return;

      const clickedGem = board[row]?.[col];
      if (!clickedGem) return;

      if (!selectedGem) {
        // 选中第一个宝石
        setSelectedGem({ row, col });
        return;
      }

      // 判断是否相邻（行差 + 列差 === 1）
      const rowDiff = Math.abs(selectedGem.row - row);
      const colDiff = Math.abs(selectedGem.col - col);
      const isAdjacent = rowDiff + colDiff === 1;

      if (!isAdjacent) {
        // 不相邻：改选
        setSelectedGem({ row, col });
        return;
      }

      // 相邻：尝试交换
      const pos1 = { row: selectedGem.row, col: selectedGem.col };
      const pos2 = { row, col };
      setSelectedGem(null);

      if (!isValidSwap(board, pos1, pos2)) {
        // 无效交换：短暂交换后还原（闪烁效果）
        setIsAnimating(true);
        isAnimatingRef.current = true;
        const swapped = swapGems(board, pos1, pos2);
        setBoard(swapped);

        setTimeout(() => {
          setBoard(board);
          setIsAnimating(false);
          isAnimatingRef.current = false;
        }, ANIMATION_CONFIG.swapDuration);
        return;
      }

      // 有效交换
      setIsAnimating(true);
      isAnimatingRef.current = true;
      onMoveMadeRef.current();

      const swapped = swapGems(board, pos1, pos2);
      setBoard(swapped);

      // 等待交换动画后开始消除循环
      setTimeout(() => {
        processCascade(swapped, 1);
      }, ANIMATION_CONFIG.swapDuration);
    },
    [board, selectedGem, processCascade],
  );

  /** 重置游戏 */
  const resetGame = useCallback((newConfig: LevelConfig) => {
    setIsAnimating(false);
    isAnimatingRef.current = false;
    setSelectedGem(null);
    setMatchedPositions(new Set());
    setCascadeCount(0);
    setBoard(initBoard(newConfig));
  }, []);

  return {
    board,
    selectedGem,
    isAnimating,
    matchedPositions,
    cascadeCount,
    handleGemClick,
    resetGame,
  };
}
