/**
 * 打地鼠游戏核心逻辑 Hook
 *
 * 管理地鼠出现、点击判定、分数计算、时间控制、难度递增和游戏统计。
 * 支持多种地鼠类型（普通、金色、炸弹）和连击系统。
 *
 * @module whack-a-mole/hooks/useWhackAMoleGame
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  HoleData,
  HoleState,
  MoleType,
  GameStatus,
  GameConfig,
  HolePosition,
  GameStats,
  ScorePopup,
} from '../types/game';
import {
  SCORE_NORMAL,
  SCORE_GOLDEN,
  SCORE_BOMB,
  COMBO_THRESHOLD,
  COMBO_BONUS,
  MAX_ACTIVE_MOLES,
} from '../constants/config';
import { useHighScore } from '@/lib/hooks/useHighScore';

/** Hook 返回类型 */
export interface UseWhackAMoleGameReturn {
  holes: HoleData[][];
  score: number;
  highScore: number;
  status: GameStatus;
  timeLeft: number;
  combo: number;
  stats: GameStats;
  scorePopups: ScorePopup[];
  start: () => void;
  togglePause: () => void;
  restart: () => void;
  whack: (row: number, col: number) => void;
}

function createInitialHoles(rows: number, cols: number): HoleData[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      state: 'empty' as HoleState,
      moleType: 'normal' as MoleType,
      key: 0,
    }))
  );
}

function getEmptyHoles(holes: HoleData[][]): HolePosition[] {
  const positions: HolePosition[] = [];
  holes.forEach((row, rowIndex) => {
    row.forEach((hole, colIndex) => {
      if (hole.state === 'empty') {
        positions.push({ row: rowIndex, col: colIndex });
      }
    });
  });
  return positions;
}

function getActiveMoleCount(holes: HoleData[][]): number {
  let count = 0;
  holes.forEach((row) => {
    row.forEach((hole) => {
      if (hole.state === 'rising' || hole.state === 'up' || hole.state === 'falling') {
        count++;
      }
    });
  });
  return count;
}

function pickMoleType(config: GameConfig): MoleType {
  const rand = Math.random();
  if (rand < config.bombMoleChance) return 'bomb';
  if (rand < config.bombMoleChance + config.goldenMoleChance) return 'golden';
  return 'normal';
}

function calcMoleScore(moleType: MoleType, combo: number): number {
  let base: number;
  switch (moleType) {
    case 'golden':
      base = SCORE_GOLDEN;
      break;
    case 'bomb':
      base = SCORE_BOMB;
      break;
    default:
      base = SCORE_NORMAL;
  }
  if (moleType !== 'bomb' && combo >= COMBO_THRESHOLD) {
    base += COMBO_BONUS * Math.floor((combo - COMBO_THRESHOLD) / 2 + 1);
  }
  return base;
}

export function useWhackAMoleGame(config: GameConfig): UseWhackAMoleGameReturn {
  const {
    rows,
    cols,
    gameDuration,
    baseMoleInterval,
    minMoleInterval,
    moleStayDuration,
    minMoleStayDuration,
    speedStep,
    speedThreshold,
  } = config;

  const [holes, setHoles] = useState<HoleData[][]>(() => createInitialHoles(rows, cols));
  const [score, setScore] = useState(0);
  const [highScore, updateHighScore] = useHighScore('whackAMoleHighScore');
  const [status, setStatus] = useState<GameStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(gameDuration);
  const [combo, setCombo] = useState(0);
  const [stats, setStats] = useState<GameStats>({ hits: 0, misses: 0, escapes: 0, maxCombo: 0 });
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);

  const holesRef = useRef<HoleData[][]>(holes);
  const scoreRef = useRef(0);
  const statusRef = useRef<GameStatus>('idle');
  const comboRef = useRef(0);
  const statsRef = useRef<GameStats>(stats);
  const elapsedTimeRef = useRef(0);
  const popupIdRef = useRef(0);
  const holeKeyRef = useRef(0);

  const moleTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const moleSpawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  holesRef.current = holes;
  scoreRef.current = score;
  statusRef.current = status;
  comboRef.current = combo;
  statsRef.current = stats;

  const getMoleInterval = useCallback(() => {
    const reduction = Math.floor(elapsedTimeRef.current / speedThreshold) * speedStep;
    return Math.max(minMoleInterval, baseMoleInterval - reduction);
  }, [baseMoleInterval, minMoleInterval, speedStep, speedThreshold]);

  const getMoleStayDuration = useCallback(() => {
    const reduction = Math.floor(elapsedTimeRef.current / speedThreshold) * speedStep;
    return Math.max(minMoleStayDuration, moleStayDuration - reduction);
  }, [moleStayDuration, minMoleStayDuration, speedStep, speedThreshold]);

  const clearAllMoleTimers = useCallback(() => {
    moleTimersRef.current.forEach((timer) => clearTimeout(timer));
    moleTimersRef.current.clear();
    if (moleSpawnTimerRef.current) {
      clearTimeout(moleSpawnTimerRef.current);
      moleSpawnTimerRef.current = null;
    }
  }, []);

  const clearGameTimer = useCallback(() => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
  }, []);

  const addScorePopup = useCallback((row: number, col: number, scoreValue: number, moleType: MoleType) => {
    const id = ++popupIdRef.current;
    const popup: ScorePopup = { id, row, col, score: scoreValue, isGolden: moleType === 'golden' };
    setScorePopups((prev) => [...prev, popup]);
    setTimeout(() => {
      setScorePopups((prev) => prev.filter((p) => p.id !== id));
    }, 800);
  }, []);

  const hideMole = useCallback(
    (row: number, col: number) => {
      if (statusRef.current !== 'playing') return;
      setHoles((prev) => {
        const newHoles = prev.map((r) => r.map((h) => ({ ...h })));
        if (newHoles[row][col].state === 'up') {
          newHoles[row][col].state = 'falling';
        }
        return newHoles;
      });
      setTimeout(() => {
        setHoles((prev) => {
          const newHoles = prev.map((r) => r.map((h) => ({ ...h })));
          if (newHoles[row][col].state === 'falling') {
            newHoles[row][col].state = 'empty';
            newHoles[row][col].moleType = 'normal';
          }
          return newHoles;
        });
      }, config.fallDuration);
      setStats((prev) => ({ ...prev, escapes: prev.escapes + 1 }));
      if (comboRef.current > 0) {
        setCombo(0);
      }
    },
    [config.fallDuration]
  );

  const showMole = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    const currentHoles = holesRef.current;
    const activeCount = getActiveMoleCount(currentHoles);
    const emptyPositions = getEmptyHoles(currentHoles);

    if (emptyPositions.length === 0 || activeCount >= MAX_ACTIVE_MOLES) {
      const timer = setTimeout(showMole, getMoleInterval());
      moleSpawnTimerRef.current = timer;
      return;
    }

    const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    const moleType = pickMoleType(config);
    const key = ++holeKeyRef.current;

    setHoles((prev) => {
      const newHoles = prev.map((r) => r.map((h) => ({ ...h })));
      newHoles[randomPos.row][randomPos.col] = { state: 'rising', moleType, key };
      return newHoles;
    });

    const riseKey = `${randomPos.row}-${randomPos.col}-rise`;
    const riseTimer = setTimeout(() => {
      setHoles((prev) => {
        const newHoles = prev.map((r) => r.map((h) => ({ ...h })));
        if (newHoles[randomPos.row][randomPos.col].key === key) {
          newHoles[randomPos.row][randomPos.col].state = 'up';
        }
        return newHoles;
      });
      moleTimersRef.current.delete(riseKey);
    }, config.riseDuration);
    moleTimersRef.current.set(riseKey, riseTimer);

    const stayKey = `${randomPos.row}-${randomPos.col}-stay`;
    const stayTimer = setTimeout(() => {
      hideMole(randomPos.row, randomPos.col);
      moleTimersRef.current.delete(stayKey);
    }, config.riseDuration + getMoleStayDuration());
    moleTimersRef.current.set(stayKey, stayTimer);

    const nextTimer = setTimeout(showMole, getMoleInterval());
    moleSpawnTimerRef.current = nextTimer;
  }, [config, getMoleInterval, getMoleStayDuration, hideMole]);

  const gameOver = useCallback(() => {
    clearAllMoleTimers();
    clearGameTimer();
    setStatus('over');
    updateHighScore(scoreRef.current);
  }, [clearAllMoleTimers, clearGameTimer, updateHighScore]);

  const start = useCallback(() => {
    setHoles(createInitialHoles(rows, cols));
    setScore(0);
    setTimeLeft(gameDuration);
    setCombo(0);
    setStats({ hits: 0, misses: 0, escapes: 0, maxCombo: 0 });
    setScorePopups([]);
    elapsedTimeRef.current = 0;
    setStatus('playing');
    statusRef.current = 'playing';

    gameTimerRef.current = setInterval(() => {
      elapsedTimeRef.current += 1;
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          gameOver();
        }
        return Math.max(0, newTime);
      });
    }, 1000);

    const startDelay = setTimeout(() => {
      showMole();
    }, 500);
    moleSpawnTimerRef.current = startDelay;
  }, [rows, cols, gameDuration, gameOver, showMole]);

  const togglePause = useCallback(() => {
    if (statusRef.current === 'playing') {
      clearAllMoleTimers();
      clearGameTimer();
      setStatus('paused');
      statusRef.current = 'paused';
    } else if (statusRef.current === 'paused') {
      setStatus('playing');
      statusRef.current = 'playing';
      gameTimerRef.current = setInterval(() => {
        elapsedTimeRef.current += 1;
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            gameOver();
          }
          return Math.max(0, newTime);
        });
      }, 1000);
      showMole();
    }
  }, [clearAllMoleTimers, clearGameTimer, gameOver, showMole]);

  const restart = useCallback(() => {
    clearAllMoleTimers();
    clearGameTimer();
    start();
  }, [clearAllMoleTimers, clearGameTimer, start]);

  const whack = useCallback(
    (row: number, col: number) => {
      if (statusRef.current !== 'playing') return;
      const currentHoles = holesRef.current;
      const hole = currentHoles[row][col];

      if (hole.state === 'empty' || hole.state === 'hit') {
        if (comboRef.current > 0) {
          setCombo(0);
        }
        setStats((prev) => ({ ...prev, misses: prev.misses + 1 }));
        return;
      }

      if (hole.state === 'falling') return;

      const { moleType } = hole;
      const riseKey = `${row}-${col}-rise`;
      const stayKey = `${row}-${col}-stay`;
      const riseTimer = moleTimersRef.current.get(riseKey);
      const stayTimer = moleTimersRef.current.get(stayKey);
      if (riseTimer) { clearTimeout(riseTimer); moleTimersRef.current.delete(riseKey); }
      if (stayTimer) { clearTimeout(stayTimer); moleTimersRef.current.delete(stayKey); }

      const newCombo = moleType === 'bomb' ? 0 : comboRef.current + 1;
      setCombo(newCombo);
      const hitScore = calcMoleScore(moleType, newCombo);

      if (newCombo > statsRef.current.maxCombo) {
        setStats((prev) => ({ ...prev, maxCombo: newCombo }));
      }

      if (moleType === 'bomb') {
        setStats((prev) => ({ ...prev, misses: prev.misses + 1 }));
      } else {
        setStats((prev) => ({ ...prev, hits: prev.hits + 1 }));
      }

      setHoles((prev) => {
        const newHoles = prev.map((r) => r.map((h) => ({ ...h })));
        newHoles[row][col].state = 'hit';
        return newHoles;
      });

      setTimeout(() => {
        setHoles((prev) => {
          const newHoles = prev.map((r) => r.map((h) => ({ ...h })));
          if (newHoles[row][col].state === 'hit') {
            newHoles[row][col].state = 'empty';
            newHoles[row][col].moleType = 'normal';
          }
          return newHoles;
        });
      }, config.hitEffectDuration);

      setScore((prev) => Math.max(0, prev + hitScore));
      addScorePopup(row, col, hitScore, moleType);
    },
    [config.hitEffectDuration, addScorePopup]
  );

  useEffect(() => {
    return () => {
      clearAllMoleTimers();
      clearGameTimer();
    };
  }, [clearAllMoleTimers, clearGameTimer]);

  return { holes, score, highScore, status, timeLeft, combo, stats, scorePopups, start, togglePause, restart, whack };
}
