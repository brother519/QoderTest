'use client';

/**
 * 2048 棋盘组件
 *
 * 负责绘制：
 * - 底层网格背景（size x size 的空格）
 * - 顶层绝对定位的所有方块（由 TileView 渲染）
 * - 触屏滑动手势（最小阈值 30px）
 *
 * @module puzzle-2048/components/Board
 */

import { useCallback, useRef } from 'react';
import { Tile, Direction } from '../types/game';
import { TileView } from './TileView';

interface BoardProps {
  /** 棋盘大小 */
  size: number;
  /** 当前方块列表 */
  tiles: Tile[];
  /** 单格像素尺寸 */
  cellSize: number;
  /** 格子间隙 */
  gap: number;
  /** 滑动动画时长（ms） */
  moveDuration: number;
  /** 触屏/键盘触发滑动 */
  onMove: (direction: Direction) => void;
}

/** 触屏手势识别的最小有效位移（像素） */
const SWIPE_THRESHOLD = 30;

export function Board({ size, tiles, cellSize, gap, moveDuration, onMove }: BoardProps) {
  // 棋盘外框总尺寸：cellSize * size + gap * (size + 1)
  const boardSize = cellSize * size + gap * (size + 1);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  /**
   * 根据触屏起止位置识别四方向滑动
   *
   * 比较水平/垂直位移大小决定主轴，再判定方向；
   * 位移过小则不触发，避免误识别。
   */
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = touchStartRef.current;
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      touchStartRef.current = null;
      if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        onMove(dx > 0 ? 'right' : 'left');
      } else {
        onMove(dy > 0 ? 'down' : 'up');
      }
    },
    [onMove]
  );

  // 背景空格（用于显示棋盘网格）
  const cells: { row: number; col: number }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      cells.push({ row: r, col: c });
    }
  }

  return (
    <div
      className="relative bg-amber-900/40 rounded-lg touch-none"
      style={{ width: boardSize, height: boardSize, padding: gap }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 背景空格 */}
      {cells.map(({ row, col }) => (
        <div
          key={`bg-${row}-${col}`}
          className="absolute bg-amber-950/40 rounded-md"
          style={{
            width: cellSize,
            height: cellSize,
            transform: `translate(${col * (cellSize + gap) + gap}px, ${row * (cellSize + gap) + gap}px)`,
          }}
        />
      ))}

      {/* 实际方块层（绝对定位，依靠 transform 平移做动画） */}
      <div className="absolute" style={{ top: gap, left: gap }}>
        {tiles.map((tile) => (
          <TileView
            key={tile.id}
            tile={tile}
            cellSize={cellSize}
            gap={gap}
            moveDuration={moveDuration}
          />
        ))}
      </div>
    </div>
  );
}
