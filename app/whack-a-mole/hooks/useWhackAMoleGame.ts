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

/**
 * 创建初始地鼠洞二维数组
 *
 * 生成 rows x cols 的网格，所有洞初始状态为空（empty），地鼠类型为普通（normal）。
 *
 * @param rows - 行数
 * @param cols - 列数
 * @returns 初始化后的二维 HoleData 数组
 */
function createInitialHoles(rows: number, cols: number): HoleData[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      state: 'empty' as HoleState,
      moleType: 'normal' as MoleType,
      key: 0,
    }))
  );
}

/**
 * 获取所有空闲洞的位置列表
 *
 * 遍历整个网格，收集所有 state 为 'empty' 的洞坐标，
 * 用于在生成新地鼠时选择可用位置。
 *
 * @param holes - 当前地鼠洞二维数组
 * @returns 空闲洞的位置数组
 */
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

/**
 * 统计当前活跃（正在显示）的地鼠数量
 *
 * 活跃状态包括：升起中（rising）、完全露出（up）、落下中（falling）。
 * 用于限制同时出现的地鼠数量，避免过多地鼠同时出现。
 *
 * @param holes - 当前地鼠洞二维数组
 * @returns 活跃地鼠的数量
 */
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

/**
 * 根据概率随机选择地鼠类型
 *
 * 生成随机数，按照配置的概率依次判断：
 * - 炸弹地鼠（bombMoleChance）
 * - 金色地鼠（goldenMoleChance）
 * - 普通地鼠（剩余概率）
 *
 * @param config - 游戏配置
 * @returns 随机选中的地鼠类型
 */
function pickMoleType(config: GameConfig): MoleType {
  const rand = Math.random();
  if (rand < config.bombMoleChance) return 'bomb';
  if (rand < config.bombMoleChance + config.goldenMoleChance) return 'golden';
  return 'normal';
}

/**
 * 计算击中地鼠的得分
 *
 * 根据地鼠类型返回基础分数（普通 10、金色 25、炸弹 -15），
 * 若当前连击数达到 COMBO_THRESHOLD，非炸弹地鼠会获得连击奖励加成。
 * 连击奖励公式：COMBO_BONUS * floor((combo - COMBO_THRESHOLD) / 2 + 1)
 *
 * @param moleType - 地鼠类型
 * @param combo - 当前连击数
 * @returns 本次击中的得分（可能为负数）
 */
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

/**
 * 打地鼠游戏核心 Hook
 *
 * 封装游戏全部状态与逻辑，包括：
 * - 地鼠洞网格状态管理
 * - 地鼠生成、升起、停留、落下的生命周期控制
 * - 点击（whack）判定与分数计算
 * - 连击系统与奖励加成
 * - 倒计时与难度递增（地鼠出现间隔和停留时间随时间缩短）
 * - 游戏状态流转（idle -> playing <-> paused -> over）
 * - 最高分持久化（localStorage）
 *
 * @param config - 游戏配置参数
 * @returns 游戏状态和控制方法
 */
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

  // ==================== 游戏状态 ====================
  const [holes, setHoles] = useState<HoleData[][]>(() => createInitialHoles(rows, cols)); // 地鼠洞网格
  const [score, setScore] = useState(0); // 当前得分
  const [highScore, updateHighScore] = useHighScore('whackAMoleHighScore'); // 历史最高分（localStorage 持久化）
  const [status, setStatus] = useState<GameStatus>('idle'); // 游戏状态
  const [timeLeft, setTimeLeft] = useState(gameDuration); // 剩余时间（秒）
  const [combo, setCombo] = useState(0); // 当前连击数
  const [stats, setStats] = useState<GameStats>({ hits: 0, misses: 0, escapes: 0, maxCombo: 0 }); // 游戏统计
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]); // 分数弹出动画队列

  // ==================== Ref 引用 ====================
  // 使用 Ref 在回调/定时器中获取最新值，避免闭包陷阱
  const holesRef = useRef<HoleData[][]>(holes);
  const scoreRef = useRef(0);
  const statusRef = useRef<GameStatus>('idle');
  const comboRef = useRef(0);
  const statsRef = useRef<GameStats>(stats);
  const elapsedTimeRef = useRef(0); // 已过去的秒数，用于计算难度递增
  const popupIdRef = useRef(0); // 分数弹出动画自增 ID
  const holeKeyRef = useRef(0); // 地鼠洞唯一 key 自增计数器，用于触发动画重置

  // ==================== 定时器引用 ====================
  const moleTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map()); // 各地鼠的升起/停留定时器
  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null); // 游戏倒计时计时器
  const moleSpawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // 下一只地鼠的生成定时器

  // 每次渲染同步 Ref 为最新值
  holesRef.current = holes;
  scoreRef.current = score;
  statusRef.current = status;
  comboRef.current = combo;
  statsRef.current = stats;

  /**
   * 根据已过去时间计算当前地鼠出现间隔
   * 随游戏时间推进，间隔逐渐缩短，最小不低于 minMoleInterval
   */
  const getMoleInterval = useCallback(() => {
    const reduction = Math.floor(elapsedTimeRef.current / speedThreshold) * speedStep;
    return Math.max(minMoleInterval, baseMoleInterval - reduction);
  }, [baseMoleInterval, minMoleInterval, speedStep, speedThreshold]);

  /**
   * 根据已过去时间计算当前地鼠停留时长
   * 随游戏时间推进，停留时间逐渐缩短，最小不低于 minMoleStayDuration
   */
  const getMoleStayDuration = useCallback(() => {
    const reduction = Math.floor(elapsedTimeRef.current / speedThreshold) * speedStep;
    return Math.max(minMoleStayDuration, moleStayDuration - reduction);
  }, [moleStayDuration, minMoleStayDuration, speedStep, speedThreshold]);

  /** 清除所有地鼠相关的定时器（升起、停留、生成） */
  const clearAllMoleTimers = useCallback(() => {
    moleTimersRef.current.forEach((timer) => clearTimeout(timer));
    moleTimersRef.current.clear();
    if (moleSpawnTimerRef.current) {
      clearTimeout(moleSpawnTimerRef.current);
      moleSpawnTimerRef.current = null;
    }
  }, []);

  /** 清除游戏倒计时计时器 */
  const clearGameTimer = useCallback(() => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
  }, []);

  /**
   * 添加分数弹出动画
   * 在指定位置创建一个分数弹出提示，800ms 后自动移除
   */
  const addScorePopup = useCallback((row: number, col: number, scoreValue: number, moleType: MoleType) => {
    const id = ++popupIdRef.current;
    const popup: ScorePopup = { id, row, col, score: scoreValue, isGolden: moleType === 'golden' };
    setScorePopups((prev) => [...prev, popup]);
    setTimeout(() => {
      setScorePopups((prev) => prev.filter((p) => p.id !== id));
    }, 800);
  }, []);

  /**
   * 隐藏指定位置的地鼠（地鼠逃跑）
   *
   * 将地鼠状态从 'up' 切换到 'falling'，经过落下动画时长后变为 'empty'。
   * 同时增加逃跑计数并重置连击。
   */
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

  /**
   * 生成一只新地鼠
   *
   * 流程：
   * 1. 检查游戏状态、空闲洞位和活跃地鼠数量上限
   * 2. 在随机空闲位置放置地鼠，初始状态为 'rising'
   * 3. 经过升起动画后状态变为 'up'
   * 4. 经过停留时间后自动调用 hideMole 隐藏
   * 5. 递归调度下一只地鼠的生成
   */
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

  /** 游戏结束处理：清除所有定时器、设置状态为 over、更新最高分 */
  const gameOver = useCallback(() => {
    clearAllMoleTimers();
    clearGameTimer();
    setStatus('over');
    updateHighScore(scoreRef.current);
  }, [clearAllMoleTimers, clearGameTimer, updateHighScore]);

  /**
   * 开始游戏
   *
   * 重置所有状态（网格、分数、时间、连击、统计），
   * 启动每秒倒计时计时器，并在 500ms 延迟后开始生成地鼠。
   */
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

  /**
   * 切换暂停/继续
   *
   * 暂停时：清除所有定时器，冻结游戏状态。
   * 继续时：重新启动倒计时和地鼠生成。
   */
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

  /** 重新开始游戏：清除所有定时器后重新调用 start */
  const restart = useCallback(() => {
    clearAllMoleTimers();
    clearGameTimer();
    start();
  }, [clearAllMoleTimers, clearGameTimer, start]);

  /**
   * 玩家点击（敲击）指定位置
   *
   * 判定逻辑：
   * - 空洞/已击中状态：算作未中（miss），重置连击
   * - 落下中状态：忽略点击
   * - 正在升起/完全露出状态：算作有效击中
   *   - 清除该位置的升起和停留定时器
   *   - 根据地鼠类型计算得分（炸弹扣分并重置连击，其他加分并累加连击）
   *   - 更新统计数据和最高连击记录
   *   - 显示击中动画效果，经过 hitEffectDuration 后恢复空洞
   *   - 触发分数弹出动画
   */
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

  /** 组件卸载时清理所有定时器，防止内存泄漏 */
  useEffect(() => {
    return () => {
      clearAllMoleTimers();
      clearGameTimer();
    };
  }, [clearAllMoleTimers, clearGameTimer]);

  return { holes, score, highScore, status, timeLeft, combo, stats, scorePopups, start, togglePause, restart, whack };
}
