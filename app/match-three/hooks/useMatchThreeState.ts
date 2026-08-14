/**
 * 消消乐状态管理 Hook
 *
 * 管理游戏分数、步数、状态和胜利/失败判定。
 *
 * @module app/match-three/hooks/useMatchThreeState
 */

'use client';

import { useState, useCallback } from 'react';

import type {
  GameStatus,
  LevelConfig,
  MatchResult,
  GameLevel,
} from '../types/game';

import { SCORE_CONFIG } from '../constants/config';

export interface UseMatchThreeStateReturn {
  status: GameStatus;
  score: number;
  movesLeft: number;
  level: GameLevel;
  cascadeCount: number;
  setStatus: (status: GameStatus) => void;
  setLevel: (level: GameLevel) => void;
  handleMatch: (matches: MatchResult[], cascadeLevel: number) => void;
  handleMoveMade: () => void;
  resetState: (config: LevelConfig) => void;
  checkWinCondition: () => boolean;
}

/** 将关卡 ID 映射为 GameLevel */
function inferLevel(config: LevelConfig): GameLevel {
  if (config.id === 'easy') return 'easy';
  if (config.id === 'medium') return 'medium';
  if (config.id === 'hard') return 'hard';
  return 'easy';
}

export function useMatchThreeState(config: LevelConfig): UseMatchThreeStateReturn {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(config.moves);
  const [level, setLevel] = useState<GameLevel>(inferLevel(config));
  const [cascadeCount, setCascadeCount] = useState(0);

  /** 处理消除加分 */
  const handleMatch = useCallback(
    (matches: MatchResult[], cascadeLevel: number) => {
      setCascadeCount(cascadeLevel);

      let addedScore = 0;
      for (const match of matches) {
        const count = match.positions.length;
        // 基础分：count * baseScore * (cascadeMultiplier ^ (cascadeLevel - 1))
        const base = count * SCORE_CONFIG.baseScore;
        const cascadeBonus = Math.pow(
          SCORE_CONFIG.cascadeMultiplier,
          cascadeLevel - 1,
        );
        let matchScore = Math.floor(base * cascadeBonus);

        // 超过3个的额外奖励
        if (count > 3) {
          matchScore += (count - 3) * SCORE_CONFIG.matchBonusPerExtra;
        }

        addedScore += matchScore;
      }

      setScore((prev) => prev + addedScore);
    },
    [],
  );

  /** 处理有效交换：减少步数，检查游戏结束 */
  const handleMoveMade = useCallback(() => {
    setMovesLeft((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        // 延迟到下一帧检查胜利条件，因为分数可能还没更新
        // 使用 setTimeout 0 确保分数状态已更新
        setTimeout(() => {
          setScore((currentScore) => {
            if (currentScore < config.targetScore) {
              setStatus('over');
            }
            return currentScore;
          });
        }, 0);
      }
      return next;
    });
  }, [config.targetScore]);

  /** 检查胜利条件 */
  const checkWinCondition = useCallback(() => {
    const won = score >= config.targetScore;
    if (won) {
      setStatus('won');
    }
    return won;
  }, [score, config.targetScore]);

  /** 重置状态 */
  const resetState = useCallback(
    (newConfig: LevelConfig) => {
      setScore(0);
      setMovesLeft(newConfig.moves);
      setStatus('idle');
      setLevel(inferLevel(newConfig));
      setCascadeCount(0);
    },
    [],
  );

  return {
    status,
    score,
    movesLeft,
    level,
    cascadeCount,
    setStatus,
    setLevel,
    handleMatch,
    handleMoveMade,
    resetState,
    checkWinCondition,
  };
}
