/**
 * 贪吃蛇游戏画布组件
 *
 * 使用 Canvas 2D 渲染蛇身、食物和网格背景。
 *
 * @module snake/components/SnakeCanvas
 */

'use client';

import { useRef, useEffect } from 'react';
import { Position, GameConfig } from '../types/game';

interface SnakeCanvasProps {
  /** 蛇身坐标 */
  snake: Position[];
  /** 食物位置 */
  food: Position;
  /** 游戏配置 */
  config: GameConfig;
}

export function SnakeCanvas({ snake, food, config }: SnakeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { cols, rows, gridSize } = config;
  const width = cols * gridSize;
  const height = rows * gridSize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 绘制网格背景
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        ctx.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
      }
    }

    // 绘制蛇身（渐变色，蛇头高亮）
    snake.forEach((seg, i) => {
      const ratio = 1 - i / snake.length;
      const g = Math.floor(200 + 55 * ratio);
      ctx.fillStyle = i === 0 ? '#22c55e' : `rgb(0, ${g}, 80)`;
      ctx.fillRect(
        seg.x * gridSize + 1,
        seg.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2
      );
    });

    // 绘制食物（红色圆形）
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(
      food.x * gridSize + gridSize / 2,
      food.y * gridSize + gridSize / 2,
      gridSize / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, [snake, food, cols, rows, gridSize, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border-2 border-cyan-400 rounded-lg bg-[#16213e] block"
    />
  );
}
