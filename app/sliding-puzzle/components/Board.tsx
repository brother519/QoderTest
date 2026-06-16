/**
 * 滑动拼图棋盘组件
 *
 * @module sliding-puzzle/components/Board
 */

'use client';

import { Tile } from './Tile';

interface BoardProps {
    board: number[];
    size: number;
    canMove: (index: number) => boolean;
    selectedIndex: number | null;
    cellSize: number;
    gap: number;
    moveDuration: number;
    onTileClick: (index: number) => void;
}

export function Board({
    board,
    size,
    canMove,
    selectedIndex,
    cellSize,
    gap,
    moveDuration,
    onTileClick,
}: BoardProps) {
    return (
        <div
            className="inline-grid bg-slate-900/50 p-3 rounded-2xl border border-slate-700/50"
            style={{
                gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
                gap,
            }}
        >
            {board.map((value, index) => (
                <Tile
                    key={`tile-${value}`}
                    value={value}
                    size={size}
                    cellSize={cellSize}
                    gap={gap}
                    isMovable={canMove(index)}
                    isSelected={selectedIndex === index}
                    moveDuration={moveDuration}
                    onClick={() => onTileClick(index)}
                />
            ))}
        </div>
    );
}
