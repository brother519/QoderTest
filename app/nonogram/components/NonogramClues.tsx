'use client';

import type { Clues } from '../types/game';

interface NonogramCluesProps {
    rowClues: Clues;
    colClues: Clues;
    cellSize: number;
    isRowComplete: (index: number) => boolean;
    isColComplete: (index: number) => boolean;
}

export function NonogramClues({
    rowClues,
    colClues,
    cellSize,
    isRowComplete,
    isColComplete,
}: NonogramCluesProps): React.JSX.Element {
    const maxRowClueLen = Math.max(...rowClues.map((c) => c.length), 1);
    const maxColClueLen = Math.max(...colClues.map((c) => c.length), 1);
    const clueWidth = maxRowClueLen * 24;
    const clueHeight = maxColClueLen * 20;

    return (
        <>
            {/* Column clues - positioned above the grid */}
            <div
                className="flex"
                style={{ marginLeft: clueWidth + 1, height: clueHeight }}
            >
                {colClues.map((clue, colIdx) => (
                    <div
                        key={colIdx}
                        className="flex flex-col items-center justify-end"
                        style={{ width: cellSize }}
                    >
                        {clue.map((num, i) => (
                            <span
                                key={i}
                                className={`text-xs font-medium leading-tight ${
                                    isColComplete(colIdx)
                                        ? 'text-green-500 line-through'
                                        : 'text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {num}
                            </span>
                        ))}
                    </div>
                ))}
            </div>

            {/* Row clues - positioned left of each row */}
            <div className="absolute" style={{ top: clueHeight, width: clueWidth }}>
                {rowClues.map((clue, rowIdx) => (
                    <div
                        key={rowIdx}
                        className="flex items-center justify-end gap-1 pr-2"
                        style={{ height: cellSize }}
                    >
                        {clue.map((num, i) => (
                            <span
                                key={i}
                                className={`text-xs font-medium ${
                                    isRowComplete(rowIdx)
                                        ? 'text-green-500 line-through'
                                        : 'text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {num}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
}
