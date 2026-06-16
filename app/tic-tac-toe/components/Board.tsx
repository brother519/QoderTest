'use client';

/**
 * 井字棋棋盘渲染
 *
 * @module tic-tac-toe/components/Board
 */

import { Cell } from '../types/game';
import { BOARD_SIZE, CELL_SIZE } from '../constants/config';
import { CellView } from './CellView';

interface BoardProps {
    board: Cell[][];
    winningLine: [number, number][] | null;
    disabled: boolean;
    onCellClick: (row: number, col: number) => void;
}

export function Board({ board, winningLine, disabled, onCellClick }: BoardProps) {
    const winningSet = new Set(winningLine?.map(([r, c]) => `${r}-${c}`) ?? []);

    return (
        <div className="inline-grid bg-slate-900/50 p-2 rounded-xl border border-slate-700/50 gap-1.5"
            style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)` }}
        >
            {board.map((row, r) =>
                row.map((cell, c) => (
                    <CellView
                        key={`${r}-${c}`}
                        value={cell}
                        isWinning={winningSet.has(`${r}-${c}`)}
                        disabled={disabled}
                        onClick={() => onCellClick(r, c)}
                    />
                )),
            )}
        </div>
    );
}
