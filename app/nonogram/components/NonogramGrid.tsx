'use client';

import type { CellState } from '../types/game';
import { CELL_COLORS } from '../constants/config';

interface NonogramGridProps {
    grid: CellState[][];
    cellSize: number;
    onCellClick: (row: number, col: number) => void;
    onCellRightClick: (row: number, col: number) => void;
}

export function NonogramGrid({
    grid,
    cellSize,
    onCellClick,
    onCellRightClick,
}: NonogramGridProps): React.JSX.Element {
    const size = grid.length;

    return (
        <div
            className="grid border border-gray-400 dark:border-gray-500"
            style={{
                gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
            }}
        >
            {grid.map((row, r) =>
                row.map((cell, c) => (
                    <button
                        key={`${r}-${c}`}
                        className={`
                            border border-gray-300 dark:border-gray-600
                            flex items-center justify-center
                            transition-colors duration-75
                            hover:opacity-80 cursor-pointer
                            ${CELL_COLORS[cell]}
                            ${r % 5 === 0 && r > 0 ? 'border-t-gray-500 border-t-2' : ''}
                            ${c % 5 === 0 && c > 0 ? 'border-l-gray-500 border-l-2' : ''}
                        `}
                        style={{ width: cellSize, height: cellSize }}
                        onClick={() => onCellClick(r, c)}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            onCellRightClick(r, c);
                        }}
                    >
                        {cell === 'marked' && (
                            <span className="text-red-400 font-bold text-sm select-none">✕</span>
                        )}
                    </button>
                ))
            )}
        </div>
    );
}
