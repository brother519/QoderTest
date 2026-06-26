/**
 * Maze board rendering component
 *
 * Renders the maze grid with walls, player position, and exit marker.
 * Uses CSS borders to represent walls for each cell.
 *
 * @module maze/components/MazeBoard
 */

'use client';

import { MazeGrid, PlayerPosition } from '../types/game';

interface MazeBoardProps {
    /** The maze grid data */
    grid: MazeGrid;
    /** Current player position */
    playerPosition: PlayerPosition;
    /** Exit position (bottom-right corner) */
    exitPosition: PlayerPosition;
    /** Cell size in pixels */
    cellSize: number;
}

export function MazeBoard({ grid, playerPosition, exitPosition, cellSize }: MazeBoardProps) {
    const size = grid.length;
    const boardSize = size * cellSize;

    // Wall thickness scales with cell size
    const wallWidth = Math.max(1, Math.floor(cellSize / 8));

    return (
        <div
            className="relative border-2 border-slate-600 rounded-md overflow-hidden shadow-lg shadow-emerald-900/30"
            style={{ width: boardSize, height: boardSize }}
        >
            {grid.map((row, rowIdx) =>
                row.map((cell, colIdx) => {
                    const isPlayer =
                        rowIdx === playerPosition.row && colIdx === playerPosition.col;
                    const isExit =
                        rowIdx === exitPosition.row && colIdx === exitPosition.col;

                    return (
                        <div
                            key={`${rowIdx}-${colIdx}`}
                            className="absolute"
                            style={{
                                top: rowIdx * cellSize,
                                left: colIdx * cellSize,
                                width: cellSize,
                                height: cellSize,
                            }}
                        >
                            {/* Cell background */}
                            <div
                                className={`absolute inset-0 transition-colors duration-150 ${
                                    isPlayer
                                        ? 'bg-emerald-400'
                                        : isExit
                                            ? 'bg-amber-400/80'
                                            : 'bg-slate-800/40'
                                }`}
                            />

                            {/* Player marker */}
                            {isPlayer && (
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <div
                                        className="rounded-full bg-emerald-300 shadow-md shadow-emerald-500/50 animate-pulse"
                                        style={{
                                            width: cellSize * 0.55,
                                            height: cellSize * 0.55,
                                        }}
                                    />
                                </div>
                            )}

                            {/* Exit marker */}
                            {isExit && !isPlayer && (
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <span
                                        style={{ fontSize: cellSize * 0.6 }}
                                        className="leading-none"
                                    >
                                        🏁
                                    </span>
                                </div>
                            )}

                            {/* Walls */}
                            {cell.top && (
                                <div
                                    className="absolute top-0 left-0 right-0 bg-slate-400"
                                    style={{ height: wallWidth }}
                                />
                            )}
                            {cell.bottom && (
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-slate-400"
                                    style={{ height: wallWidth }}
                                />
                            )}
                            {cell.left && (
                                <div
                                    className="absolute top-0 left-0 bottom-0 bg-slate-400"
                                    style={{ width: wallWidth }}
                                />
                            )}
                            {cell.right && (
                                <div
                                    className="absolute top-0 right-0 bottom-0 bg-slate-400"
                                    style={{ width: wallWidth }}
                                />
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}
