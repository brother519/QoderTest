'use client';

/**
 * 游戏状态管理 Hook
 *
 * 负责管理连连看游戏的核心状态，包括分数、计时、连击（combo）、提示次数等，
 * 并提供开始、暂停、继续、重置等游戏控制方法。
 *
 * 与 useLinkMatchGame 的分工：
 * - useLinkMatchState：管理"游戏运营"层面的状态（分数、时间、连击、提示、生命周期）
 * - useLinkMatchGame：管理"游戏规则"层面的逻辑（棋盘、路径、匹配、重排）
 *
 * @module link-match/hooks/useLinkMatchState
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus } from '../types/game';
import {
  SCORE_CONFIG,
  GAME_CONFIG,
} from '../constants/config';

/**
 * useLinkMatchState Hook 的返回值类型定义
 */
export interface UseLinkMatchStateReturn {
  /** 当前游戏得分 */
  score: number;
  /** 已用时间（秒） */
  timeElapsed: number;
  /** 当前游戏状态：idle | playing | paused | won */
  status: GameStatus;
  /** 当前连击次数 */
  combo: number;
  /** 剩余提示次数 */
  hintsRemaining: number;
  /** 开始游戏，将状态切换为 playing */
  startGame: () => void;
  /** 暂停游戏，仅在 playing 状态下有效 */
  pauseGame: () => void;
  /** 继续游戏，仅在 paused 状态下有效 */
  resumeGame: () => void;
  /** 处理一次匹配结果，匹配成功则增加分数和连击，失败则重置连击 */
  addScore: (isMatch: boolean) => void;
  /** 使用一次提示，成功返回 true，提示用完返回 false */
  useHint: () => boolean;
  /** 重置所有游戏状态到初始值 */
  resetState: () => void;
  /** 标记游戏胜利，将状态切换为 won */
  setGameWon: () => void;
}

/**
 * 游戏状态管理 Hook
 *
 * 管理连连看游戏的全部运行时状态，包括：
 * - 分数计算：基础得分 + 连击加分
 * - 计时器：游戏进行中每秒递增
 * - 连击系统：匹配成功累加连击次数，超时或匹配失败则重置
 * - 提示系统：有限次提示，使用提示会扣分
 * - 游戏生命周期控制：开始、暂停、继续、胜利、重置
 *
 * @returns {UseLinkMatchStateReturn} 游戏状态与控制方法
 */
export function useLinkMatchState(): UseLinkMatchStateReturn {
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [combo, setCombo] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(GAME_CONFIG.maxHints);

  /** 存储 combo 超时计时器的 ref，避免闭包导致的引用问题 */
  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 清理 combo 超时计时器 */
  const clearComboTimeout = useCallback(() => {
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
      comboTimeoutRef.current = null;
    }
  }, []);

  /** 重置连击次数并清理超时计时器 */
  const resetCombo = useCallback(() => {
    setCombo(0);
    clearComboTimeout();
  }, [clearComboTimeout]);

  /** 启动 combo 超时计时器，超时后自动重置连击次数 */
  const startComboTimeout = useCallback(() => {
    clearComboTimeout();
    comboTimeoutRef.current = setTimeout(() => {
      setCombo(0);
    }, GAME_CONFIG.comboTimeout);
  }, [clearComboTimeout]);

  /**
   * 游戏计时器
   * 当状态为 playing 时，每秒递增 timeElapsed
   * 状态变化或组件卸载时自动清理 interval
   */
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (status === 'playing') {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [status]);

  /** 组件卸载时清理 combo 超时计时器，防止内存泄漏 */
  useEffect(() => {
    return () => {
      clearComboTimeout();
    };
  }, [clearComboTimeout]);

  /** 开始游戏，将状态切换为 playing */
  const startGame = useCallback(() => {
    setStatus('playing');
  }, []);

  /** 暂停游戏，仅在 playing 状态下生效 */
  const pauseGame = useCallback(() => {
    if (status === 'playing') {
      setStatus('paused');
    }
  }, [status]);

  /** 继续游戏，仅在 paused 状态下生效 */
  const resumeGame = useCallback(() => {
    if (status === 'paused') {
      setStatus('playing');
    }
  }, [status]);

  /**
   * 处理匹配结果并更新分数
   * - 匹配成功：累加连击次数，计算得分 = 基础分 + (连击数 - 1) * 连击加分系数
   * - 匹配失败：重置连击次数
   * @param isMatch - 本次匹配是否成功
   */
  const addScore = useCallback(
    (isMatch: boolean) => {
      if (!isMatch) {
        resetCombo();
        return;
      }

      setCombo((prevCombo) => {
        const newCombo = prevCombo + 1;
        const comboBonus = (newCombo - 1) * SCORE_CONFIG.comboMultiplier;
        const totalPoints = SCORE_CONFIG.baseScore + comboBonus;

        setScore((prevScore) => prevScore + totalPoints);

        // 每次成功匹配后重启 combo 超时计时器
        startComboTimeout();

        return newCombo;
      });
    },
    [resetCombo, startComboTimeout]
  );

  /**
   * 使用一次提示
   * - 提示次数 > 0 时：消耗一次提示，扣除相应分数（不低于 0），返回 true
   * - 提示次数 <= 0 时：返回 false，不做任何操作
   * @returns {boolean} 是否成功使用提示
   */
  const useHint = useCallback((): boolean => {
    if (hintsRemaining <= 0) {
      return false;
    }

    setHintsRemaining((prev) => prev - 1);
    setScore((prev) => Math.max(0, prev - SCORE_CONFIG.hintPenalty));
    return true;
  }, [hintsRemaining]);

  /** 重置所有游戏状态到初始值（分数、时间、状态、连击、提示次数） */
  const resetState = useCallback(() => {
    setScore(0);
    setTimeElapsed(0);
    setStatus('idle');
    setCombo(0);
    setHintsRemaining(GAME_CONFIG.maxHints);
    clearComboTimeout();
  }, [clearComboTimeout]);

  /** 标记游戏胜利，将状态切换为 won 并清理 combo 计时器 */
  const setGameWon = useCallback(() => {
    setStatus('won');
    clearComboTimeout();
  }, [clearComboTimeout]);

  return {
    score,
    timeElapsed,
    status,
    combo,
    hintsRemaining,
    startGame,
    pauseGame,
    resumeGame,
    addScore,
    useHint,
    resetState,
    setGameWon,
  };
}
