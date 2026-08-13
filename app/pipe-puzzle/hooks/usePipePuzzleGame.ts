/**
 * 接水管游戏核心逻辑 Hook
 *
 * 管理棋盘生成、管道旋转、连通性检测、关卡进度和分数。
 *
 * @module pipe-puzzle/hooks/usePipePuzzle
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import {
    PipeCell,
    PipeType,
    Rotation,
    PipePuzzleConfig,
    PipePuzzleStatus,
    UsePipePuzzleReturn,
} from '../types/game';
import { BASE_LEVEL_SCORE, MOVE_PENALTY, DIFFICULTY_CONFIG } from '../constants/config';
import { useHighScore } from '@/lib/hooks/useHighScore';

/** 各管道类型在 rotation=0 时的开口方向 (top=0, right=1, bottom=2, left=3) */
const PIPE_OPENINGS: Record<PipeType, number[]> = {
    straight: [0, 2], // 上下直通
    corner: [0, 1], // 右上角
    tee: [0, 1, 2], // T 型 (缺左)
    cross: [0, 1, 2, 3], // 十字
    end: [0], // 端头
};

/** 获取当前旋转后的开口方向列表 */
function getOpenings(cell: PipeCell): number[] {
    return PIPE_OPENINGS[cell.type].map((d) => (d + cell.rotation) % 4);
}

/** 方向对面索引 */
const OPPOSITE_DIR: Record<number, number> = { 0: 2, 1: 3, 2: 0, 3: 1 };

/** 方向 -> 行列偏移 */
const DIR_OFFSET: Record<number, [number, number]> = {
    0: [-1, 0], // top
    1: [0, 1], // right
    2: [1, 0], // bottom
    3: [0, -1], // left
};

/** 使用 BFS 检测从 source 是否能到达 target，返回所有连通格子 */
function computeFlow(board: PipeCell[][]): Set<string> {
    const rows = board.length;
    const cols = board[0].length;
    const filled = new Set<string>();

    // 找到 source
    let sourceRow = -1;
    let sourceCol = -1;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c].isSource) {
                sourceRow = r;
                sourceCol = c;
            }
        }
    }
    if (sourceRow === -1) return filled;

    const queue: [number, number][] = [[sourceRow, sourceCol]];
    filled.add(`${sourceRow},${sourceCol}`);

    while (queue.length > 0) {
        const [r, c] = queue.shift()!;
        const openings = getOpenings(board[r][c]);

        for (const dir of openings) {
            const [dr, dc] = DIR_OFFSET[dir];
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            const key = `${nr},${nc}`;
            if (filled.has(key)) continue;

            // 检查邻居是否有对向开口
            const neighborOpenings = getOpenings(board[nr][nc]);
            if (neighborOpenings.includes(OPPOSITE_DIR[dir])) {
                filled.add(key);
                queue.push([nr, nc]);
            }
        }
    }

    return filled;
}

/** 生成一个有解的随机棋盘 */
function generateBoard(rows: number, cols: number, level: number): PipeCell[][] {
    // 1. 先生成一条从 source 到 target 的路径
    const board: PipeCell[][] = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({
            type: 'straight' as PipeType,
            rotation: 0 as Rotation,
            isSource: false,
            isTarget: false,
            filled: false,
        }))
    );

    // Source 在左上角区域, Target 在右下角区域
    const sourceRow = 0;
    const sourceCol = 0;
    const targetRow = rows - 1;
    const targetCol = cols - 1;

    board[sourceRow][sourceCol].isSource = true;
    board[targetRow][targetCol].isTarget = true;

    // 用随机 DFS 生成从 source 到 target 的路径
    const path = generatePath(rows, cols, sourceRow, sourceCol, targetRow, targetCol);

    // 根据路径方向确定每个格子的管道类型和旋转
    for (let i = 0; i < path.length; i++) {
        const [r, c] = path[i];
        const connections: number[] = [];

        if (i > 0) {
            const [pr, pc] = path[i - 1];
            connections.push(getDirection(r, c, pr, pc));
        }
        if (i < path.length - 1) {
            const [nr, nc] = path[i + 1];
            connections.push(getDirection(r, c, nr, nc));
        }

        const { type, rotation } = findPipeForConnections(connections);
        board[r][c].type = type;
        board[r][c].rotation = rotation;
    }

    // 填充非路径格子以增加复杂度
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!path.some(([pr, pc]) => pr === r && pc === c)) {
                const types: PipeType[] = ['straight', 'corner', 'tee', 'cross'];
                board[r][c].type = types[Math.floor(Math.random() * types.length)];
                board[r][c].rotation = (Math.floor(Math.random() * 4)) as Rotation;
            }
        }
    }

    // 保存正确解
    const solution: Rotation[][] = board.map((row) => row.map((cell) => cell.rotation));

    // 随机旋转所有格子（打乱）
    const shuffleAmount = Math.min(1 + level, 3);
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const rotations = 1 + Math.floor(Math.random() * shuffleAmount);
            board[r][c].rotation = ((board[r][c].rotation + rotations) % 4) as Rotation;
            // 确保打乱后和原始不同（至少一个格子不同）
        }
    }

    // 确保打乱后不是已解状态
    let isSolved = true;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c].rotation !== solution[r][c]) {
                isSolved = false;
                break;
            }
        }
        if (!isSolved) break;
    }
    if (isSolved) {
        // 额外旋转一个格子
        board[0][0].rotation = ((board[0][0].rotation + 1) % 4) as Rotation;
    }

    return board;
}

/** 获取从 (r,c) 到相邻 (tr,tc) 的方向 */
function getDirection(r: number, c: number, tr: number, tc: number): number {
    if (tr === r - 1) return 0; // top
    if (tc === c + 1) return 1; // right
    if (tr === r + 1) return 2; // bottom
    return 3; // left
}

/** 为给定连接方向集合找到合适的管道类型和旋转 */
function findPipeForConnections(connections: number[]): { type: PipeType; rotation: Rotation } {
    if (connections.length === 1) {
        // end pipe: 只有一个连接
        const dir = connections[0];
        return { type: 'end', rotation: dir as Rotation };
    }

    if (connections.length === 2) {
        const [a, b] = connections.sort((x, y) => x - y);
        // 检查是否是直管 (对向连接)
        if ((a === 0 && b === 2) || (a === 1 && b === 3)) {
            // straight: 基础 openings 是 [0,2], rotation=0 → top/bottom
            if (a === 0 && b === 2) return { type: 'straight', rotation: 0 };
            return { type: 'straight', rotation: 1 };
        }
        // corner: 基础 openings 是 [0,1] (top+right)
        // 需要找到使 openings 匹配 connections 的旋转
        for (let rot = 0; rot < 4; rot++) {
            const openings = PIPE_OPENINGS.corner.map((d) => (d + rot) % 4).sort((x, y) => x - y);
            if (openings[0] === a && openings[1] === b) {
                return { type: 'corner', rotation: rot as Rotation };
            }
        }
    }

    if (connections.length === 3) {
        const sorted = [...connections].sort((x, y) => x - y);
        for (let rot = 0; rot < 4; rot++) {
            const openings = PIPE_OPENINGS.tee
                .map((d) => (d + rot) % 4)
                .sort((x, y) => x - y);
            if (
                openings[0] === sorted[0] &&
                openings[1] === sorted[1] &&
                openings[2] === sorted[2]
            ) {
                return { type: 'tee', rotation: rot as Rotation };
            }
        }
    }

    return { type: 'cross', rotation: 0 };
}

/** 使用随机 DFS 生成路径 */
function generatePath(
    rows: number,
    cols: number,
    sr: number,
    sc: number,
    tr: number,
    tc: number
): [number, number][] {
    const visited = new Set<string>();
    const result: [number, number][] = [];

    function dfs(r: number, c: number): boolean {
        if (r === tr && c === tc) {
            result.push([r, c]);
            return true;
        }

        visited.add(`${r},${c}`);
        result.push([r, c]);

        // 随机化方向顺序以生成不同路径
        const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        shuffle(dirs);

        // 偏好接近目标的方向
        dirs.sort((a, b) => {
            const distA = Math.abs(r + a[0] - tr) + Math.abs(c + a[1] - tc);
            const distB = Math.abs(r + b[0] - tr) + Math.abs(c + b[1] - tc);
            return distA - distB + (Math.random() - 0.5) * 2;
        });

        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (visited.has(`${nr},${nc}`)) continue;
            if (dfs(nr, nc)) return true;
        }

        result.pop();
        return false;
    }

    dfs(sr, sc);
    return result;
}

/** Fisher-Yates 洗牌 */
function shuffle<T>(arr: T[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

export function usePipePuzzle(): UsePipePuzzleReturn {
    const [board, setBoard] = useState<PipeCell[][]>([]);
    const [status, setStatus] = useState<PipePuzzleStatus>('idle');
    const [moves, setMoves] = useState(0);
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [highScore, updateHighScore] = useHighScore('pipePuzzleHighScore');

    const levelRef = useRef(1);
    levelRef.current = level;

    /** 获取当前关卡的配置 */
    const getConfig = useCallback((lvl: number): PipePuzzleConfig => {
        if (lvl <= 3) return DIFFICULTY_CONFIG.easy;
        if (lvl <= 6) return DIFFICULTY_CONFIG.medium;
        return DIFFICULTY_CONFIG.hard;
    }, []);

    /** 初始化棋盘后计算初始水流 */
    const initBoard = useCallback((newBoard: PipeCell[][]) => {
        const flow = computeFlow(newBoard);
        for (let r = 0; r < newBoard.length; r++) {
            for (let c = 0; c < newBoard[0].length; c++) {
                newBoard[r][c].filled = flow.has(`${r},${c}`);
            }
        }
        return newBoard;
    }, []);

    /** 开始新游戏 */
    const start = useCallback(() => {
        const config = getConfig(1);
        const newBoard = initBoard(generateBoard(config.rows, config.cols, 1));
        setBoard(newBoard);
        setStatus('playing');
        setMoves(0);
        setLevel(1);
        setScore(0);
    }, [getConfig, initBoard]);

    /** 重新开始当前关卡 */
    const restart = useCallback(() => {
        const config = getConfig(levelRef.current);
        const newBoard = initBoard(generateBoard(config.rows, config.cols, levelRef.current));
        setBoard(newBoard);
        setStatus('playing');
        setMoves(0);
    }, [getConfig, initBoard]);

    /** 下一关 */
    const nextLevel = useCallback(() => {
        const newLevel = levelRef.current + 1;
        setLevel(newLevel);
        const config = getConfig(newLevel);
        const newBoard = initBoard(generateBoard(config.rows, config.cols, newLevel));
        setBoard(newBoard);
        setStatus('playing');
        setMoves(0);
    }, [getConfig, initBoard]);

    const scoreRef = useRef(0);
    scoreRef.current = score;

    /** 旋转管道并检测通关 */
    const rotatePipe = useCallback(
        (row: number, col: number) => {
            if (status !== 'playing') return;

            setBoard((prev) => {
                const newBoard = prev.map((r) => r.map((cell) => ({ ...cell })));
                const cell = newBoard[row][col];
                cell.rotation = ((cell.rotation + 1) % 4) as Rotation;

                // 计算水流连通性
                const flow = computeFlow(newBoard);
                for (let r = 0; r < newBoard.length; r++) {
                    for (let c = 0; c < newBoard[0].length; c++) {
                        newBoard[r][c].filled = flow.has(`${r},${c}`);
                    }
                }

                // 检查 target 是否连通
                let targetConnected = false;
                for (let r = 0; r < newBoard.length; r++) {
                    for (let c = 0; c < newBoard[0].length; c++) {
                        if (newBoard[r][c].isTarget && flow.has(`${r},${c}`)) {
                            targetConnected = true;
                        }
                    }
                }

                if (targetConnected) {
                    // 延迟设置赢的状态，避免在 setState 更新器内部 setState
                    setTimeout(() => {
                        const levelScore = Math.max(
                            0,
                            BASE_LEVEL_SCORE - (scoreRef.current === 0 ? 1 : moves + 1) * MOVE_PENALTY
                        );
                        const newScore = scoreRef.current + levelScore;
                        setScore(newScore);
                        updateHighScore(newScore);
                        setStatus('won');
                    }, 100);
                }

                return newBoard;
            });
            setMoves((m) => m + 1);
        },
        [status, moves, updateHighScore]
    );

    return {
        board,
        status,
        moves,
        level,
        score,
        highScore,
        start,
        restart,
        nextLevel,
        rotatePipe,
    };
}
