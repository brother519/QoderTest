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
  const gridCacheRef = useRef<HTMLCanvasElement | null>(null);
  const { cols, rows, gridSize } = config;
  const width = cols * gridSize;
  const height = rows * gridSize;

  // 在客户端创建并缓存网格背景到离屏 Canvas
  useEffect(() => {
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const ctx = offscreen.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          ctx.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
        }
      }
    }
    gridCacheRef.current = offscreen;
  }, [cols, rows, gridSize, width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gridCache = gridCacheRef.current;
    if (!canvas || !gridCache) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布并绘制缓存的网格背景
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(gridCache, 0, 0);

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
  }, [snake, food, gridSize, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border-2 border-cyan-400 rounded-lg bg-[#16213e] block"
    />
  );
}
