/**
 * 扫雷棋盘组件
 *
 * @module minesweeper/components/Board
 */

'use client';

import { CellView } from './CellView';
import type { Cell, Difficulty, GameStatus } from '../types/game';

interface BoardProps {
  board: Cell[][];
  difficulty: Difficulty;
  status: GameStatus;
  overlay?: React.ReactNode;
  onReveal: (row: number, col: number) => void;
  onToggleFlag: (row: number, col: number) => void;
  onChord: (row: number, col: number) => void;
}

/** 根据难度返回合适的单元格尺寸 */
function getCellSize(difficultyKey: Difficulty['key']): number {
  switch (difficultyKey) {
    case 'expert':
      return 24;
    case 'intermediate':
      return 28;
    default:
      return 36;
  }
}

export function Board({
  board,
  difficulty,
  status,
  overlay,
  onReveal,
  onToggleFlag,
  onChord,
}: BoardProps) {
  const cellSize = getCellSize(difficulty.key);
  const isFinished = status === 'won' || status === 'lost';

  return (
    <div className="w-full h-full overflow-x-auto overflow-y-hidden flex items-center justify-center">
      <div className="relative inline-block min-w-max">
        <div className="inline-block border-2 border-slate-500 bg-slate-400">
          <div
            className="grid gap-px bg-slate-400"
            style={{ gridTemplateColumns: `repeat(${difficulty.cols}, minmax(0, 1fr))` }}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <CellView
                  key={`${rowIndex}-${colIndex}`}
                  cell={cell}
                  row={rowIndex}
                  col={colIndex}
                  size={cellSize}
                  disabled={isFinished}
                  onReveal={onReveal}
                  onToggleFlag={onToggleFlag}
                  onChord={onChord}
                />
              ))
            )}
          </div>
        </div>
        {overlay}
      </div>
    </div>
  );
}
