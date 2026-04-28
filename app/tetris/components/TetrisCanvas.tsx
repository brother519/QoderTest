/**
 * 俄罗斯方块游戏主画布组件
 *
 * 使用 Canvas 2D 渲染游戏棋盘，包括网格背景、已锁定方块和当前活动方块。
 * 每个格子绘制填充颜色和立体感边框。
 *
 * @module tetris/components/TetrisCanvas
 */

'use client';

import { useRef, useEffect } from 'react';
import { Board, ActivePiece, GameConfig } from '../types/game';
import { TETROMINOES, GRID_LINE_COLOR, CELL_BORDER_COLOR } from '../constants/config';

/** TetrisCanvas 组件属性 */
interface TetrisCanvasProps {
  /** 棋盘状态 */
  board: Board;
  /** 当前下落方块 */
  currentPiece: ActivePiece | null;
  /** 游戏配置 */
  config: GameConfig;
}

/**
 * 绘制单个方块格子（填充颜色 + 立体边框）
 *
 * @param ctx - Canvas 2D 上下文
 * @param x - 左上角像素 x 坐标
 * @param y - 左上角像素 y 坐标
 * @param size - 格子尺寸
 * @param color - 填充颜色
 */
function drawCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  // 填充底色（留 1px 间距）
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

  // 高光边（左上亮，增加立体感）
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 1, y + size - 1);
  ctx.lineTo(x + 1, y + 1);
  ctx.lineTo(x + size - 1, y + 1);
  ctx.stroke();

  // 阴影边（右下暗，增加立体感）
  ctx.strokeStyle = CELL_BORDER_COLOR;
  ctx.beginPath();
  ctx.moveTo(x + size - 1, y + 1);
  ctx.lineTo(x + size - 1, y + size - 1);
  ctx.lineTo(x + 1, y + size - 1);
  ctx.stroke();
}

export function TetrisCanvas({ board, currentPiece, config }: TetrisCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { cols, rows, cellSize } = config;
  const width = cols * cellSize;
  const height = rows * cellSize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 绘制网格背景线
    ctx.strokeStyle = GRID_LINE_COLOR;
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // 绘制已锁定方块
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = board[row][col];
        if (cell) {
          drawCell(ctx, col * cellSize, row * cellSize, cellSize, cell);
        }
      }
    }

    // 绘制当前活动方块
    if (currentPiece) {
      const { type, rotation, position } = currentPiece;
      const shape = TETROMINOES[type].shapes[rotation];
      const color = TETROMINOES[type].color;

      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            const drawX = (position.x + col) * cellSize;
            const drawY = (position.y + row) * cellSize;
            // 只绘制在棋盘可见区域内的格子
            if (position.y + row >= 0) {
              drawCell(ctx, drawX, drawY, cellSize, color);
            }
          }
        }
      }
    }
  }, [board, currentPiece, cols, rows, cellSize, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border-2 border-cyan-400 rounded-lg bg-[#16213e] block"
    />
  );
}
