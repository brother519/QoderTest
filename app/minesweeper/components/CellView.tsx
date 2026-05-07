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
  1: 'text-sky-300',
  2: 'text-emerald-300',
  3: 'text-rose-300',
  4: 'text-indigo-300',
  5: 'text-orange-300',
  6: 'text-cyan-200',
  7: 'text-fuchsia-300',
  8: 'text-slate-300',
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
    ? 'bg-gradient-to-br from-rose-500/30 via-slate-700 to-slate-900 text-rose-200'
    : 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900 text-slate-100 hover:from-slate-500 hover:to-slate-800';

  const revealedClass = cell.isMine
    ? cell.isExploded
      ? 'bg-gradient-to-br from-rose-500 to-red-700 text-white shadow-inner shadow-red-950/60'
      : 'bg-gradient-to-br from-slate-700 to-slate-900 text-rose-200'
    : 'bg-gradient-to-br from-slate-900/95 to-slate-800/90 text-white border border-cyan-400/10';

  const valueClass = cell.isRevealed && !cell.isMine && cell.adjacentMines > 0
    ? NUMBER_COLORS[cell.adjacentMines]
    : 'text-slate-100';

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
        'relative shrink-0 select-none rounded-[10px] border text-sm font-extrabold transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-cyan-300/40',
        disabled ? 'cursor-default' : 'cursor-pointer active:scale-95',
        cell.isRevealed ? revealedClass : unrevealedClass,
        cell.isRevealed ? 'border-white/5 shadow-inner' : 'border-white/10 shadow-lg shadow-black/15',
        valueClass,
      ].join(' ')}
      style={{ width: size, height: size, WebkitTouchCallout: 'none' }}
    >
      {!cell.isRevealed && !cell.isFlagged && <span className="text-[10px] text-cyan-100/20">·</span>}
      {!cell.isRevealed && cell.isFlagged && <span className="text-base leading-none">🚩</span>}
      {cell.isRevealed && cell.isMine && <span className="text-base leading-none">💣</span>}
      {cell.isRevealed && !cell.isMine && cell.adjacentMines > 0 && (
        <span className="text-sm md:text-base leading-none">{cell.adjacentMines}</span>
      )}
    </button>
  );
}
