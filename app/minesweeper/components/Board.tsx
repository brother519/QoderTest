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
    <div className="w-full overflow-x-auto pb-2">
      <div className="relative inline-block min-w-max mx-auto">
        <div className="rounded-[28px] border border-cyan-400/20 bg-slate-950/65 p-3 shadow-[0_20px_80px_rgba(8,145,178,0.15)] backdrop-blur-sm">
          <div
            className="grid gap-[3px] rounded-[22px] bg-gradient-to-br from-slate-900 via-slate-950 to-[#041319] p-3"
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
