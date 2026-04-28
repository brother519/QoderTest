/**
 * 贪吃蛇游戏核心逻辑 Hook
 *
 * 管理蛇的移动、方向控制、食物生成、碰撞检测、分数计算和速度递增。
 *
 * @module snake/hooks/useSnakeGame
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Position, Direction, GameStatus, GameConfig } from '../types/game';
import { SCORE_PER_FOOD } from '../constants/config';
import { useHighScore } from '@/lib/hooks/useHighScore';

/** 方向向量映射 */
const DIRECTION_VECTORS: Record<Direction, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

/** 反方向映射，防止蛇直接掉头 */
const OPPOSITE: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

export interface UseSnakeGameReturn {
  /** 蛇身坐标数组，索引 0 为蛇头 */
  snake: Position[];
  /** 食物位置 */
  food: Position;
  /** 当前得分 */
  score: number;
  /** 历史最高分 */
  highScore: number;
  /** 游戏状态 */
  status: GameStatus;
  /** 当前移动方向 */
  direction: Direction;
  /** 开始游戏 */
  start: () => void;
  /** 暂停/继续切换 */
  togglePause: () => void;
  /** 重新开始 */
  restart: () => void;
  /** 改变方向 */
  changeDirection: (dir: Direction) => void;
}

/**
 * 在空闲位置随机生成食物
 */
function randomFood(cols: number, rows: number, snake: Position[]): Position {
  let pos: Position;
  do {
    pos = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

/**
 * 创建初始蛇身（3 节，居中向右）
 */
function createInitialSnake(cols: number, rows: number): Position[] {
  const centerX = Math.floor(cols / 2);
  const centerY = Math.floor(rows / 2);
  return [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
  ];
}

export function useSnakeGame(config: GameConfig): UseSnakeGameReturn {
  const { cols, rows, baseInterval, minInterval, speedStep, speedThreshold } = config;

  const [snake, setSnake] = useState<Position[]>(() => createInitialSnake(cols, rows));
  const [food, setFood] = useState<Position>(() =>
    randomFood(cols, rows, createInitialSnake(cols, rows))
  );
  const [score, setScore] = useState(0);
  const [highScore, updateHighScore] = useHighScore('snakeHighScore');
  const [status, setStatus] = useState<GameStatus>('idle');
  const [direction, setDirection] = useState<Direction>('RIGHT');

  // 使用 ref 避免 setInterval 闭包捕获旧值
  const directionRef = useRef<Direction>('RIGHT');
  const snakeRef = useRef<Position[]>(snake);
  const foodRef = useRef<Position>(food);
  const scoreRef = useRef(0);
  const statusRef = useRef<GameStatus>('idle');
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 同步 ref
  snakeRef.current = snake;
  foodRef.current = food;
  scoreRef.current = score;
  statusRef.current = status;

  /** 计算当前移动间隔 */
  const getInterval = useCallback(
    (currentScore: number) => {
      const reduction = Math.floor(currentScore / speedThreshold) * speedStep;
      return Math.max(minInterval, baseInterval - reduction);
    },
    [baseInterval, minInterval, speedStep, speedThreshold]
  );

  /** 停止游戏循环 */
  const stopLoop = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, []);

  /** 游戏结束处理 */
  const gameOver = useCallback(() => {
    stopLoop();
    setStatus('over');
    updateHighScore(scoreRef.current);
  }, [stopLoop, updateHighScore]);

  /** 单步移动逻辑 */
  const tick = useCallback(() => {
    if (statusRef.current !== 'playing') return;

    const currentSnake = snakeRef.current;
    const currentFood = foodRef.current;
    const dir = directionRef.current;
    const vec = DIRECTION_VECTORS[dir];

    const head: Position = {
      x: currentSnake[0].x + vec.x,
      y: currentSnake[0].y + vec.y,
    };

    // 撞墙检测
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
      gameOver();
      return;
    }

    // 撞自身检测
    if (currentSnake.some((s) => s.x === head.x && s.y === head.y)) {
      gameOver();
      return;
    }

    const newSnake = [head, ...currentSnake];
    let newScore = scoreRef.current;
    let newFood = currentFood;

    // 吃到食物
    if (head.x === currentFood.x && head.y === currentFood.y) {
      newScore += SCORE_PER_FOOD;
      newFood = randomFood(cols, rows, newSnake);
      setFood(newFood);
      setScore(newScore);

      // 根据分数调整速度 - 立即重启循环，不使用 setTimeout
      stopLoop();
      const interval = getInterval(newScore);
      gameLoopRef.current = setInterval(tick, interval);
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
    setDirection(dir);
  }, [cols, rows, gameOver, stopLoop, baseInterval, minInterval, speedStep, speedThreshold]);

  /** 启动游戏循环 */
  const startLoop = useCallback(
    (currentScore: number) => {
      stopLoop();
      const interval = getInterval(currentScore);
      gameLoopRef.current = setInterval(tick, interval);
    },
    [stopLoop, getInterval, tick]
  );

  /** 开始游戏 */
  const start = useCallback(() => {
    setStatus('playing');
    startLoop(0);
  }, [startLoop]);

  /** 暂停/继续 */
  const togglePause = useCallback(() => {
    if (statusRef.current === 'playing') {
      stopLoop();
      setStatus('paused');
    } else if (statusRef.current === 'paused') {
      setStatus('playing');
      startLoop(scoreRef.current);
    }
  }, [stopLoop, startLoop]);

  /** 重新开始 */
  const restart = useCallback(() => {
    stopLoop();
    const initialSnake = createInitialSnake(cols, rows);
    setSnake(initialSnake);
    setFood(randomFood(cols, rows, initialSnake));
    setScore(0);
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setStatus('playing');
    startLoop(0);
  }, [cols, rows, stopLoop, startLoop]);

  /** 改变方向（防止反向） */
  const changeDirection = useCallback((newDir: Direction) => {
    const current = directionRef.current;
    if (OPPOSITE[current] !== newDir) {
      directionRef.current = newDir;
    }
  }, []);

  /** 组件卸载时清理 */
  useEffect(() => {
    return () => stopLoop();
  }, [stopLoop]);

  return {
    snake,
    food,
    score,
    highScore,
    status,
    direction,
    start,
    togglePause,
    restart,
    changeDirection,
  };
}
