'use client';

/**
 * 推箱子棋盘渲染组件
 *
 * 渲染整个游戏网格，组合格子组件。
 *
 * @module sokoban/components/Board
 */

import { CellType, Position } from '../types/game';
import { CellView } from './CellView';

interface BoardProps {
    /** 静态地图网格 */
    grid: CellType[][];
    /** 目标位置列表 */
    targets: Position[];
    /** 玩家位置 */
    player: Position;
    /** 箱子位置列表 */
    boxes: Position[];
    /** 地图行数 */
    rows: number;
    /** 地图列数 */
    cols: number;
}

function samePos(a: Position, b: Position): boolean {
    return a.row === b.row && a.col === b.col;
}

export function Board({ grid, targets, player, boxes, rows, cols }: BoardProps) {
    return (
        <div
            className="inline-grid gap-0 bg-stone-900/50 p-2 rounded-lg border border-stone-700/50"
            style={{
                gridTemplateColumns: `repeat(${cols}, auto)`,
                gridTemplateRows: `repeat(${rows}, auto)`,
            }}
        >
            {Array.from({ length: rows }, (_, r) =>
                Array.from({ length: cols }, (_, c) => {
                    const cellType = grid[r][c];
                    const isTarget = targets.some((t) => t.row === r && t.col === c);
                    const hasPlayer = player.row === r && player.col === c;
                    const hasBox = boxes.some((b) => b.row === r && b.col === c);

                    return (
                        <CellView
                            key={`${r}-${c}`}
                            cellType={cellType}
                            hasPlayer={hasPlayer}
                            hasBox={hasBox}
                            isTarget={isTarget}
                        />
                    );
                })
            )}
        </div>
    );
}
