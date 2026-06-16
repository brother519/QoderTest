/**
 * 贪吃蛇游戏核心逻辑 Hook
 *
 * 管理蛇的移动、方向控制、食物生成、碰撞检测、分数计算和速度递增。
 *
 * @module snake/hooks/useSnakeGame
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { Position, Direction, GameStatus, GameConfig } from '../types/game';
import { SCORE_PER_FOOD } from '../constants/config';
import { useHighScore } from '@/lib/hooks/useHighScore';
import { useIntervalLoop } from '@/lib/hooks/useIntervalLoop';

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
  snake: Position[];
  food: Position;
  score: number;
  highScore: number;
  status: GameStatus;
  direction: Direction;
  start: () => void;
  togglePause: () => void;
  restart: () => void;
  changeDirection: (dir: Direction) => void;
}

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

  const directionRef = useRef<Direction>('RIGHT');
  const snakeRef = useRef<Position[]>(snake);
  const foodRef = useRef<Position>(food);
  const scoreRef = useRef(0);

  snakeRef.current = snake;
  foodRef.current = food;
  scoreRef.current = score;

  const getInterval = useCallback(
    (currentScore: number) => {
      const reduction = Math.floor(currentScore / speedThreshold) * speedStep;
      return Math.max(minInterval, baseInterval - reduction);
    },
    [baseInterval, minInterval, speedStep, speedThreshold]
  );

  const tick = useCallback(() => {
    const currentSnake = snakeRef.current;
    const currentFood = foodRef.current;
    const dir = directionRef.current;
    const vec = DIRECTION_VECTORS[dir];

    const head: Position = {
      x: currentSnake[0].x + vec.x,
      y: currentSnake[0].y + vec.y,
    };

    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
      setStatus('over');
      updateHighScore(scoreRef.current);
      return;
    }

    if (currentSnake.some((s) => s.x === head.x && s.y === head.y)) {
      setStatus('over');
      updateHighScore(scoreRef.current);
      return;
    }

    const newSnake = [head, ...currentSnake];
    let newScore = scoreRef.current;
    let newFood = currentFood;

    if (head.x === currentFood.x && head.y === currentFood.y) {
      newScore += SCORE_PER_FOOD;
      newFood = randomFood(cols, rows, newSnake);
      setFood(newFood);
      setScore(newScore);
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
    setDirection(dir);
  }, [cols, rows, updateHighScore]);

  useIntervalLoop(tick, getInterval(score), status === 'playing');

  const start = useCallback(() => {
    setStatus('playing');
  }, []);

  const togglePause = useCallback(() => {
    if (status === 'playing') {
      setStatus('paused');
    } else if (status === 'paused') {
      setStatus('playing');
    }
  }, [status]);

  const restart = useCallback(() => {
    const initialSnake = createInitialSnake(cols, rows);
    setSnake(initialSnake);
    setFood(randomFood(cols, rows, initialSnake));
    setScore(0);
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setStatus('playing');
  }, [cols, rows]);

  const changeDirection = useCallback((newDir: Direction) => {
    const current = directionRef.current;
    if (OPPOSITE[current] !== newDir) {
      directionRef.current = newDir;
    }
  }, []);

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
