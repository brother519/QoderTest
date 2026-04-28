/**
 * 提示高亮管理 Hook
 *
 * 管理连连看游戏中提示功能的视觉状态，包括：
 * - 高亮卡牌的显示与 3 秒后自动清除
 * - 计时器的生命周期管理（防止内存泄漏）
 *
 * @module link-match/hooks/useHintManager
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Card } from '../types/game';

/** useHintManager Hook 的返回值类型 */
interface UseHintManagerReturn {
  /** 当前被提示高亮的卡牌列表 */
  hintedCards: Card[];
  /** 显示提示高亮，3 秒后自动消失 */
  showHint: (pair: [Card, Card]) => void;
  /** 立即清除提示高亮和计时器 */
  clearHint: () => void;
}

/**
 * 提示高亮管理 Hook
 *
 * @returns 提示状态与控制方法
 */
export function useHintManager(): UseHintManagerReturn {
  /** 当前被提示高亮的卡牌对 */
  const [hintedCards, setHintedCards] = useState<Card[]>([]);
  /** 提示高亮的自动清除计时器引用 */
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 清除提示高亮及其计时器 */
  const clearHint = useCallback(() => {
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }
    setHintedCards([]);
  }, []);

  /** 显示一对卡牌的提示高亮，3 秒后自动清除 */
  const showHint = useCallback(
    (pair: [Card, Card]) => {
      setHintedCards(pair);

      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }

      hintTimeoutRef.current = setTimeout(() => {
        setHintedCards([]);
      }, 3000);
    },
    []
  );

  /** 组件卸载时清理计时器，防止内存泄漏 */
  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
    };
  }, []);

  return { hintedCards, showHint, clearHint };
}
