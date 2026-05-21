'use client';

/**
 * 棋盘容器组件
 *
 * @module app/match-three/components/GameBoard
 */

import type { Board } from '../types/game';
import { GemCell } from './GemCell';

interface GameBoardProps {
  board: Board;
  selectedGem: { row: number; col: number } | null;
  matchedPositions: Set<string>;
  isAnimating: boolean;
  onGemClick: (row: number, col: number) => void;
}

export function GameBoard({
  board,
  selectedGem,
  matchedPositions,
  isAnimating,
  onGemClick,
}: GameBoardProps) {
  const rows = board.length;
  const cols = rows > 0 ? board[0].length : 0;

  return (
    <div
      className={`
        inline-grid gap-1.5 sm:gap-2 p-3 sm:p-4
        rounded-2xl
        bg-white/10 backdrop-blur-md
        border border-white/20
        shadow-xl shadow-black/20
        ${isAnimating ? 'pointer-events-none' : ''}
      `}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {board.map((row, rowIdx) =>
        row.map((gem, colIdx) => {
          const posKey = `${rowIdx}-${colIdx}`;
          const isSelected =
            selectedGem?.row === rowIdx && selectedGem?.col === colIdx;
          const isMatched = matchedPositions.has(posKey);

          return (
            <GemCell
              key={gem ? gem.id : `empty-${posKey}`}
              gem={gem}
              isSelected={isSelected}
              isMatched={isMatched}
              onClick={() => onGemClick(rowIdx, colIdx)}
            />
          );
        }),
      )}
    </div>
  );
}
