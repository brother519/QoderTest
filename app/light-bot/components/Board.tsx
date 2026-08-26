'use client';

/**
 * Light-bot 棋盘
 *
 * DOM + Tailwind 渲染网格，包含空地、墙、灯、机器人。
 * 机器人用 transform 平滑移动。
 *
 * @module light-bot/components/Board
 */

import { Level, Pos } from '../types/game';

interface BoardProps {
    level: Level;
    robot: Pos;
    litLamps: string[];
    posKey: (p: Pos) => string;
    cellSizePx?: number;
}

export function Board({
    level,
    robot,
    litLamps,
    posKey,
    cellSizePx = 64,
}: BoardProps) {
    const wallSet = new Set(level.walls.map(posKey));
    const lampSet = new Set(level.lamps.map(posKey));
    const litSet = new Set(litLamps);

    const boardPx = level.size * cellSizePx;

    return (
        <div
            className="relative rounded-lg bg-slate-800/60 p-2 shadow-inner"
            style={{ width: boardPx + 16, height: boardPx + 16 }}
        >
            <div
                className="relative grid"
                style={{
                    gridTemplateColumns: `repeat(${level.size}, ${cellSizePx}px)`,
                    gridTemplateRows: `repeat(${level.size}, ${cellSizePx}px)`,
                    width: boardPx,
                    height: boardPx,
                }}
            >
                {Array.from({ length: level.size }).map((_, r) =>
                    Array.from({ length: level.size }).map((__, c) => {
                        const key = `${r},${c}`;
                        const isWall = wallSet.has(key);
                        const isLamp = lampSet.has(key);
                        const isLit = litSet.has(key);

                        return (
                            <div
                                key={key}
                                className={`
                                    border border-slate-700/50 flex items-center justify-center
                                    ${isWall ? 'bg-slate-950' : 'bg-slate-700/30'}
                                `}
                                style={{ width: cellSizePx, height: cellSizePx }}
                            >
                                {isWall && (
                                    <div className="w-10 h-10 rounded bg-slate-600 shadow-inner" />
                                )}
                                {isLamp && (
                                    <div
                                        className={`w-5 h-5 rounded-full transition-all duration-300
                                            ${isLit
                                                ? 'bg-yellow-300 shadow-[0_0_16px_4px_rgba(253,224,71,0.8)]'
                                                : 'bg-yellow-700/60'
                                            }`}
                                    />
                                )}
                            </div>
                        );
                    }),
                )}

                {/* 机器人覆盖层 */}
                <div
                    className="absolute transition-all duration-300 ease-in-out
                               w-10 h-10 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]
                               flex items-center justify-center text-slate-900 font-bold"
                    style={{
                        transform: `translate(${robot.col * cellSizePx + 12}px, ${robot.row * cellSizePx + 12}px)`,
                    }}
                >
                    🤖
                </div>
            </div>
        </div>
    );
}
