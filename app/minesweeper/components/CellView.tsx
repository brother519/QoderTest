/**
 * 扫雷单元格组件
 *
 * @module minesweeper/components/CellView
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { LONG_PRESS_DURATION } from '../constants/config';
import type { Cell } from '../types/game';

interface CellViewProps {
  cell: Cell;
  row: number;
  col: number;
  size: number;
  disabled: boolean;
  onReveal: (row: number, col: number) => void;
  onToggleFlag: (row: number, col: number) => void;
  onChord: (row: number, col: number) => void;
}

/** 数字颜色映射 */
const NUMBER_COLORS: Record<number, string> = {
  1: 'text-blue-600',
  2: 'text-green-700',
  3: 'text-red-600',
  4: 'text-purple-700',
  5: 'text-orange-700',
  6: 'text-teal-600',
  7: 'text-slate-800',
  8: 'text-gray-500',
};

export function CellView({
  cell,
  row,
  col,
  size,
  disabled,
  onReveal,
  onToggleFlag,
  onChord,
}: CellViewProps) {
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClickRef = useRef(false);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearLongPressTimer, [clearLongPressTimer]);

  const handleClick = useCallback(() => {
    if (disabled) {
      return;
    }

    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    onReveal(row, col);
  }, [col, disabled, onReveal, row]);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      if (disabled) {
        return;
      }

      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        return;
      }

      onToggleFlag(row, col);
    },
    [col, disabled, onToggleFlag, row]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled || (event.pointerType !== 'touch' && event.pointerType !== 'pen')) {
        return;
      }

      clearLongPressTimer();
      longPressTimerRef.current = setTimeout(() => {
        suppressClickRef.current = true;
        onToggleFlag(row, col);
      }, LONG_PRESS_DURATION);
    },
    [clearLongPressTimer, col, disabled, onToggleFlag, row]
  );

  const handlePointerUp = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  const handleDoubleClick = useCallback(() => {
    if (!disabled && cell.isRevealed && cell.adjacentMines > 0) {
      onChord(row, col);
    }
  }, [cell.adjacentMines, cell.isRevealed, col, disabled, onChord, row]);

  const unrevealedClass = cell.isFlagged
    ? 'bg-amber-100'
    : 'bg-slate-300 hover:bg-slate-200';

  const revealedClass = cell.isMine
    ? cell.isExploded
      ? 'bg-red-200'
      : 'bg-slate-200'
    : 'bg-white';

  const valueClass = cell.isRevealed && !cell.isMine && cell.adjacentMines > 0
    ? NUMBER_COLORS[cell.adjacentMines]
    : '';

  return (
    <button
      type="button"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      disabled={disabled}
      aria-label={`第${row + 1}行第${col + 1}列`}
      className={[
        'flex items-center justify-center select-none font-bold text-sm transition-colors duration-75',
        'focus:outline-none',
        disabled ? 'cursor-default' : 'cursor-pointer',
        cell.isRevealed ? revealedClass : unrevealedClass,
        valueClass,
      ].filter(Boolean).join(' ')}
      style={{ width: size, height: size, WebkitTouchCallout: 'none' }}
    >
      {!cell.isRevealed && cell.isFlagged && <span className="text-base leading-none">🚩</span>}
      {cell.isRevealed && cell.isMine && <span className="text-base leading-none">💣</span>}
      {cell.isRevealed && !cell.isMine && cell.adjacentMines > 0 && (
        <span className="text-sm md:text-base leading-none">{cell.adjacentMines}</span>
      )}
    </button>
  );
}
