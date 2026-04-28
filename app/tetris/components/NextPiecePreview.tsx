/**
 * 下一个方块预览组件
 *
 * 使用小型 Canvas 2D 渲染下一个即将出现的方块，
 * 显示方块的初始旋转状态并居中显示。
 *
 * @module tetris/components/NextPiecePreview
 */

'use client';

import { useRef, useEffect } from 'react';
import { TetrominoType, GameConfig } from '../types/game';
import { TETROMINOES, CELL_BORDER_COLOR } from '../constants/config';

/** NextPiecePreview 组件属性 */
interface NextPiecePreviewProps {
  /** 下一个方块类型 */
  pieceType: TetrominoType;
  /** 游戏配置（取 previewCellSize） */
  config: GameConfig;
}

/**
 * 绘制预览区的单个格子
 *
 * @param ctx - Canvas 2D 上下文
 * @param x - 左上角像素 x 坐标
 * @param y - 左上角像素 y 坐标
 * @param size - 格子尺寸
 * @param color - 填充颜色
 */
function drawPreviewCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  // 填充底色
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

  // 高光边
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 1, y + size - 1);
  ctx.lineTo(x + 1, y + 1);
  ctx.lineTo(x + size - 1, y + 1);
  ctx.stroke();

  // 阴影边
  ctx.strokeStyle = CELL_BORDER_COLOR;
  ctx.beginPath();
  ctx.moveTo(x + size - 1, y + 1);
  ctx.lineTo(x + size - 1, y + size - 1);
  ctx.lineTo(x + 1, y + size - 1);
  ctx.stroke();
}

export function NextPiecePreview({ pieceType, config }: NextPiecePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellSize = config.previewCellSize;
  // 使用 4×4 的画布尺寸，容纳最大的 I 方块
  const canvasSize = 4 * cellSize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // 获取方块初始旋转状态
    const shape = TETROMINOES[pieceType].shapes[0];
    const color = TETROMINOES[pieceType].color;

    // 计算方块实际占用的行列范围，用于居中
    const shapeRows = shape.length;
    const shapeCols = shape[0].length;

    // 居中偏移
    const offsetX = Math.floor((4 - shapeCols) / 2) * cellSize;
    const offsetY = Math.floor((4 - shapeRows) / 2) * cellSize;

    // 绘制方块
    for (let row = 0; row < shapeRows; row++) {
      for (let col = 0; col < shapeCols; col++) {
        if (shape[row][col]) {
          drawPreviewCell(
            ctx,
            offsetX + col * cellSize,
            offsetY + row * cellSize,
            cellSize,
            color
          );
        }
      }
    }
  }, [pieceType, cellSize, canvasSize]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className="bg-[#16213e] rounded block mx-auto"
    />
  );
}
