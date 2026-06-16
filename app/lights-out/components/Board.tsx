'use client';

/**
 * 点灯游戏棋盘渲染
 *
 * @module lights-out/components/Board
 */

import { CellView } from './CellView';
import { CELL_GAP } from '../constants/config';

interface BoardProps {
    grid: boolean[][];
    size: number;
    onToggle: (row: number, col: number) => void;
}

export function Board({ grid, size, onToggle }: BoardProps) {
    return (
        <div
            className="inline-grid bg-slate-900/50 p-3 rounded-xl border border-slate-700/50"
            style={{
                gridTemplateColumns: `repeat(${size}, auto)`,
                gap: CELL_GAP,
            }}
        >
            {grid.map((row, r) =>
                row.map((isOn, c) => (
                    <CellView
                        key={`${r}-${c}`}
                        isOn={isOn}
                        onClick={() => onToggle(r, c)}
                    />
                ))
            )}
        </div>
    );
}
