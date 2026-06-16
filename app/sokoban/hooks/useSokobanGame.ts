'use client';

/**
 * 推箱子核心游戏逻辑 Hook
 *
 * 管理关卡解析、玩家移动、推箱子判定、撤销、过关检测等全部游戏状态。
 *
 * @module sokoban/hooks/useSokobanGame
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { CellType, Direction, GameState, MoveSnapshot, ParsedLevel, Position } from '../types/game';
import { DIRECTION_DELTA } from '../constants/config';
import { LEVELS } from '../constants/levels';

/** 解析字符地图为结构化关卡数据 */
function parseLevel(map: string[]): ParsedLevel {
    const rows = map.length;
    const cols = Math.max(...map.map((r) => r.length));

    const grid: CellType[][] = [];
    const targets: Position[] = [];
    const boxStarts: Position[] = [];
    let playerStart: Position = { row: 0, col: 0 };

    for (let r = 0; r < rows; r++) {
        const row: CellType[] = [];
        for (let c = 0; c < cols; c++) {
            const ch = map[r][c] ?? ' ';
            switch (ch) {
                case '#':
                    row.push('wall');
                    break;
                case '.':
                    row.push('target');
                    targets.push({ row: r, col: c });
                    break;
                case '$':
                    row.push('floor');
                    boxStarts.push({ row: r, col: c });
                    break;
                case '@':
                    row.push('floor');
                    playerStart = { row: r, col: c };
                    break;
                case '+':
                    row.push('target');
                    targets.push({ row: r, col: c });
                    playerStart = { row: r, col: c };
                    break;
                case '*':
                    row.push('target');
                    targets.push({ row: r, col: c });
                    boxStarts.push({ row: r, col: c });
                    break;
                default:
                    row.push('floor');
                    break;
            }
        }
        grid.push(row);
    }

    return { grid, playerStart, boxStarts, targets, rows, cols };
}

/** 检查两个位置是否相同 */
function samePos(a: Position, b: Position): boolean {
    return a.row === b.row && a.col === b.col;
}

/** 检查所有箱子是否都在目标点上 */
function allBoxesOnTargets(boxes: Position[], targets: Position[]): boolean {
    return targets.every((t) => boxes.some((b) => samePos(b, t)));
}

/**
 * 推箱子游戏核心 Hook
 *
 * @param levelIndex - 当前关卡索引（0 起）
 */
export function useSokobanGame(levelIndex: number) {
    const parsed = useMemo(() => parseLevel(LEVELS[levelIndex].map), [levelIndex]);

    const [gameState, setGameState] = useState<GameState>(() => ({
        player: { ...parsed.playerStart },
        boxes: parsed.boxStarts.map((b) => ({ ...b })),
        moves: 0,
        pushes: 0,
        status: 'playing',
    }));

    const historyRef = useRef<MoveSnapshot[]>([]);

    /** 移动玩家 */
    const move = useCallback(
        (direction: Direction) => {
            setGameState((prev) => {
                if (prev.status === 'won') return prev;

                const delta = DIRECTION_DELTA[direction];
                const nextRow = prev.player.row + delta.row;
                const nextCol = prev.player.col + delta.col;

                // 检查目标格子是否在地图范围内
                if (nextRow < 0 || nextRow >= parsed.rows || nextCol < 0 || nextCol >= parsed.cols) {
                    return prev;
                }

                // 检查是否撞墙
                if (parsed.grid[nextRow][nextCol] === 'wall') {
                    return prev;
                }

                const nextPos: Position = { row: nextRow, col: nextCol };

                // 检查目标格是否有箱子
                const boxIndex = prev.boxes.findIndex((b) => samePos(b, nextPos));

                if (boxIndex !== -1) {
                    // 有箱子，尝试推动
                    const pushRow = nextRow + delta.row;
                    const pushCol = nextCol + delta.col;

                    // 箱子推动目标超出范围
                    if (pushRow < 0 || pushRow >= parsed.rows || pushCol < 0 || pushCol >= parsed.cols) {
                        return prev;
                    }

                    // 箱子推动目标是墙
                    if (parsed.grid[pushRow][pushCol] === 'wall') {
                        return prev;
                    }

                    const pushPos: Position = { row: pushRow, col: pushCol };

                    // 箱子推动目标有其他箱子
                    if (prev.boxes.some((b) => samePos(b, pushPos))) {
                        return prev;
                    }

                    // 保存历史快照用于撤销
                    historyRef.current.push({
                        player: { ...prev.player },
                        boxes: prev.boxes.map((b) => ({ ...b })),
                    });

                    // 推动成功
                    const newBoxes = prev.boxes.map((b, i) =>
                        i === boxIndex ? { ...pushPos } : { ...b }
                    );

                    const newStatus = allBoxesOnTargets(newBoxes, parsed.targets) ? 'won' : 'playing';

                    return {
                        player: nextPos,
                        boxes: newBoxes,
                        moves: prev.moves + 1,
                        pushes: prev.pushes + 1,
                        status: newStatus,
                    };
                }

                // 没有箱子，普通移动
                historyRef.current.push({
                    player: { ...prev.player },
                    boxes: prev.boxes.map((b) => ({ ...b })),
                });

                return {
                    ...prev,
                    player: nextPos,
                    moves: prev.moves + 1,
                };
            });
        },
        [parsed]
    );

    /** 撤销上一步 */
    const undo = useCallback(() => {
        const snapshot = historyRef.current.pop();
        if (!snapshot) return;

        setGameState((prev) => ({
            ...prev,
            player: snapshot.player,
            boxes: snapshot.boxes,
            moves: Math.max(0, prev.moves - 1),
            pushes: prev.pushes - (snapshot.boxes.some((b, i) => !samePos(b, prev.boxes[i])) ? 1 : 0),
            status: 'playing',
        }));
    }, []);

    /** 重置当前关卡 */
    const reset = useCallback(() => {
        historyRef.current = [];
        setGameState({
            player: { ...parsed.playerStart },
            boxes: parsed.boxStarts.map((b) => ({ ...b })),
            moves: 0,
            pushes: 0,
            status: 'playing',
        });
    }, [parsed]);

    return {
        /** 静态地图网格 */
        grid: parsed.grid,
        /** 目标位置列表 */
        targets: parsed.targets,
        /** 地图行数 */
        rows: parsed.rows,
        /** 地图列数 */
        cols: parsed.cols,
        /** 玩家当前位置 */
        player: gameState.player,
        /** 箱子位置列表 */
        boxes: gameState.boxes,
        /** 移动步数 */
        moves: gameState.moves,
        /** 推箱子次数 */
        pushes: gameState.pushes,
        /** 游戏状态 */
        status: gameState.status,
        /** 是否可以撤销 */
        canUndo: historyRef.current.length > 0,
        /** 移动玩家 */
        move,
        /** 撤销上一步 */
        undo,
        /** 重置关卡 */
        reset,
    };
}
