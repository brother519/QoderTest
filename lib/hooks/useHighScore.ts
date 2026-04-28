'use client';

/**
 * 高分管理 Hook
 *
 * 封装 localStorage 读写高分的通用逻辑，各游戏通过不同的 key 区分。
 *
 * @module lib/hooks/useHighScore
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * @param storageKey - localStorage 中存储高分的键名
 * @returns [highScore, updateHighScore] - 高分值及更新函数（仅当新分数超过记录时写入）
 */
export function useHighScore(storageKey: string): [number, (score: number) => void] {
  const [highScore, setHighScore] = useState(0);
  const isInitialized = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && !isInitialized.current) {
        isInitialized.current = true;
        setHighScore(parseInt(saved, 10));
      }
    } catch {
      // localStorage 不可用时使用默认值
    }
  }, [storageKey]);

  const updateHighScore = useCallback(
    (score: number) => {
      if (score > highScore) {
        setHighScore(score);
        try {
          localStorage.setItem(storageKey, String(score));
        } catch {
          // localStorage 不可用时忽略
        }
      }
    },
    [storageKey, highScore]
  );

  return [highScore, updateHighScore];
}
