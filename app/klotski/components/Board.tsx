'use client';

import { Block } from '../types/game';
import { BOARD_COLS, BOARD_ROWS, EXIT_ROW, EXIT_COL } from '../constants/config';
import { BlockView } from './BlockView';

interface BoardProps {
    blocks: Block[];
    selectedBlockId: string | null;
    cellSize: number;
    gap: number;
    onSelectBlock: (id: string) => void;
    onDragMove: (id: string, dr: number, dc: number) => void;
}

/**
 * The Klotski game board container.
 * Renders a background grid, exit indicator, and all block pieces.
 * Ancient wood/dark stone aesthetic with ink-painting accents.
 */
export function Board({
    blocks,
    selectedBlockId,
    cellSize,
    gap,
    onSelectBlock,
    onDragMove,
}: BoardProps) {
    // Calculate total board pixel dimensions
    const boardWidth = BOARD_COLS * cellSize + (BOARD_COLS + 1) * gap;
    const boardHeight = BOARD_ROWS * cellSize + (BOARD_ROWS + 1) * gap;

    // Exit indicator dimensions (2 cells wide, 2 cells tall for the king)
    const exitLeft = EXIT_COL * (cellSize + gap) + gap;
    const exitTop = EXIT_ROW * (cellSize + gap) + gap;
    const exitWidth = 2 * cellSize + gap;
    const exitHeight = 2 * cellSize + gap;

    return (
        <div
            className="relative rounded-xl border-4 border-stone-700/80 shadow-2xl
                bg-gradient-to-b from-stone-800 via-stone-900 to-stone-950
                ring-1 ring-stone-600/30"
            style={{
                width: boardWidth,
                height: boardHeight,
                padding: gap,
            }}
        >
            {/* Subtle inner shadow overlay */}
            <div className="absolute inset-0 rounded-xl pointer-events-none shadow-inner ring-1 ring-inset ring-black/20" />

            {/* Background grid cells */}
            {Array.from({ length: BOARD_ROWS }).map((_, r) =>
                Array.from({ length: BOARD_COLS }).map((_, c) => (
                    <div
                        key={`cell-${r}-${c}`}
                        className="absolute rounded-sm bg-stone-700/30 border border-stone-600/20"
                        style={{
                            width: cellSize,
                            height: cellSize,
                            left: c * (cellSize + gap) + gap,
                            top: r * (cellSize + gap) + gap,
                        }}
                    />
                )),
            )}

            {/* Exit indicator - golden dashed border with glow */}
            <div
                className="absolute rounded-md border-2 border-dashed border-yellow-500/60
                    bg-yellow-500/5 shadow-[inset_0_0_20px_rgba(234,179,8,0.15)]"
                style={{
                    width: exitWidth,
                    height: exitHeight,
                    left: exitLeft,
                    top: exitTop,
                }}
            >
                {/* Golden glow corners */}
                <div className="absolute -inset-1 rounded-lg bg-yellow-400/5 blur-sm pointer-events-none" />
            </div>

            {/* Exit label below the indicator */}
            <div
                className="absolute text-yellow-500/70 text-xs font-bold tracking-widest pointer-events-none"
                style={{
                    left: exitLeft,
                    top: exitTop + exitHeight + 2,
                    width: exitWidth,
                    textAlign: 'center',
                }}
            >
                &#9661; 出口 &#9661;
            </div>

            {/* Block pieces layer */}
            <div
                className="absolute"
                style={{
                    left: gap,
                    top: gap,
                    width: BOARD_COLS * (cellSize + gap) - gap,
                    height: BOARD_ROWS * (cellSize + gap) - gap,
                }}
            >
                {blocks.map((block) => (
                    <BlockView
                        key={block.id}
                        block={block}
                        cellSize={cellSize}
                        gap={gap}
                        isSelected={selectedBlockId === block.id}
                        onSelect={onSelectBlock}
                        onDragMove={onDragMove}
                    />
                ))}
            </div>

            {/* Decorative border corners for ancient aesthetic */}
            <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-yellow-700/40 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-yellow-700/40 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-yellow-700/40 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-yellow-700/40 rounded-br-sm pointer-events-none" />
        </div>
    );
}
