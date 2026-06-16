/**
 * 数字输入面板组件
 *
 * 提供 1-9 数字按钮、笔记模式和擦除功能。
 *
 * @module sudoku/components/NumberPad
 */

import { SudokuCell } from '../types/game';
import { GRID_SIZE } from '../constants/config';

interface NumberPadProps {
    board: SudokuCell[][];
    notesMode: boolean;
    onInputNumber: (num: number) => void;
    onToggleNotes: () => void;
    onErase: () => void;
    onUndo: () => void;
    canUndo: boolean;
}

export function NumberPad({
    board,
    notesMode,
    onInputNumber,
    onToggleNotes,
    onErase,
    onUndo,
    canUndo,
}: NumberPadProps) {
    const numberCounts = Array(10).fill(0);
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const val = board[r][c].value;
            if (val !== 0) numberCounts[val]++;
        }
    }

    return (
        <div className="flex flex-col gap-3 w-full max-w-sm">
            <div className="grid grid-cols-9 gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                    const isComplete = numberCounts[num] >= 9;
                    return (
                        <button
                            key={num}
                            onClick={() => onInputNumber(num)}
                            disabled={isComplete}
                            className={`
                                aspect-square flex flex-col items-center justify-center rounded-lg
                                text-lg font-bold transition-all
                                ${
                                    isComplete
                                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
                                }
                            `}
                        >
                            {num}
                            {!isComplete && (
                                <span className="text-[9px] text-indigo-200 -mt-1">{9 - numberCounts[num]}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className={`
                        flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                        ${
                            canUndo
                                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        }
                    `}
                >
                    撤销
                </button>
                <button
                    onClick={onErase}
                    className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white transition-all"
                >
                    擦除
                </button>
                <button
                    onClick={onToggleNotes}
                    className={`
                        flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                        ${notesMode ? 'bg-amber-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}
                    `}
                >
                    笔记 {notesMode ? 'ON' : 'OFF'}
                </button>
            </div>
        </div>
    );
}
