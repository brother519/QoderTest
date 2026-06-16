/**
 * 数独棋盘组件
 *
 * 渲染 9x9 网格，处理单元格选择和数字高亮。
 *
 * @module sudoku/components/Board
 */

import { SudokuCell } from '../types/game';
import { GRID_SIZE } from '../constants/config';

interface BoardProps {
    board: SudokuCell[][];
    selectedCell: { row: number; col: number } | null;
    onSelectCell: (row: number, col: number) => void;
}

export function Board({ board, selectedCell, onSelectCell }: BoardProps) {
    const selectedValue = selectedCell ? board[selectedCell.row][selectedCell.col].value : 0;

    return (
        <div className="inline-block border-2 border-indigo-400 rounded-lg overflow-hidden shadow-xl">
            {Array.from({ length: GRID_SIZE }, (_, row) => (
                <div key={row} className="flex">
                    {Array.from({ length: GRID_SIZE }, (_, col) => {
                        const cell = board[row][col];
                        const isSelected = selectedCell?.row === row && selectedCell?.col === col;
                        const isSameRow = selectedCell?.row === row;
                        const isSameCol = selectedCell?.col === col;
                        const isSameBox =
                            selectedCell &&
                            Math.floor(selectedCell.row / 3) === Math.floor(row / 3) &&
                            Math.floor(selectedCell.col / 3) === Math.floor(col / 3);
                        const isSameNumber = selectedValue !== 0 && cell.value === selectedValue;
                        const isRelated = isSameRow || isSameCol || isSameBox;

                        const borderRight = col === 2 || col === 5 ? 'border-r-2 border-r-indigo-400' : 'border-r border-r-indigo-400/30';
                        const borderBottom = row === 2 || row === 5 ? 'border-b-2 border-b-indigo-400' : 'border-b border-b-indigo-400/30';

                        let bgClass = 'bg-slate-800';
                        if (isSelected) bgClass = 'bg-indigo-600';
                        else if (isSameNumber && !cell.hasConflict) bgClass = 'bg-indigo-500/30';
                        else if (isRelated) bgClass = 'bg-slate-700';

                        let textClass = '';
                        if (cell.hasConflict && cell.value !== 0) textClass = 'text-red-400';
                        else if (cell.isGiven) textClass = 'text-white font-bold';
                        else textClass = 'text-indigo-300';

                        return (
                            <button
                                key={col}
                                onClick={() => onSelectCell(row, col)}
                                className={`
                                    w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center
                                    ${borderRight} ${borderBottom}
                                    ${bgClass}
                                    transition-colors duration-100
                                    hover:bg-indigo-500/20
                                    focus:outline-none
                                `}
                            >
                                {cell.value !== 0 ? (
                                    <span className={`text-lg sm:text-xl ${textClass}`}>{cell.value}</span>
                                ) : cell.notes.size > 0 ? (
                                    <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                                            <span
                                                key={n}
                                                className="flex items-center justify-center text-[8px] sm:text-[10px] text-slate-400"
                                            >
                                                {cell.notes.has(n) ? n : ''}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
