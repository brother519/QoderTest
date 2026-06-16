/**
 * 滑动拼图游戏核心 Hook
 *
 * 管理棋盘状态、移动、计时、胜利判定和最佳记录。
 *
 * @module sliding-puzzle/hooks/useSlidingPuzzleGame
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameConfig, GameStatus, BestRecord } from '../types/game';
import { DEFAULT_CONFIG, BEST_RECORD_KEY, SHUFFLE_MOVES } from '../constants/config';

/** 棋盘类型：一维数组，长度为 size * size */
type Board = number[];

/** 加载本地最佳记录 */
function loadBestRecord(): BestRecord {
    if (typeof window === 'undefined') {
        return { moves: null, time: null };
    }
    try {
        const raw = localStorage.getItem(BEST_RECORD_KEY);
        if (!raw) return { moves: null, time: null };
        return JSON.parse(raw) as BestRecord;
    } catch {
        return { moves: null, time: null };
    }
}

/** 保存本地最佳记录 */
function saveBestRecord(record: BestRecord): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(BEST_RECORD_KEY, JSON.stringify(record));
    } catch {
        // ignore storage errors
    }
}

/** 创建已完成的有序棋盘 */
function createSolvedBoard(size: number): Board {
    const total = size * size;
    return Array.from({ length: total }, (_, i) => (i + 1) % total);
}

/** 检查棋盘是否已获胜 */
function isBoardSolved(board: Board): boolean {
    for (let i = 0; i < board.length - 1; i++) {
        if (board[i] !== i + 1) return false;
    }
    return board[board.length - 1] === 0;
}

/** 获取空格索引 */
function getEmptyIndex(board: Board): number {
    return board.indexOf(0);
}

/** 获取有效移动方向索引 */
function getMovableIndices(board: Board, size: number): number[] {
    const emptyIndex = getEmptyIndex(board);
    const row = Math.floor(emptyIndex / size);
    const col = emptyIndex % size;
    const indices: number[] = [];

    if (row > 0) indices.push(emptyIndex - size); // 上方
    if (row < size - 1) indices.push(emptyIndex + size); // 下方
    if (col > 0) indices.push(emptyIndex - 1); // 左方
    if (col < size - 1) indices.push(emptyIndex + 1); // 右方

    return indices;
}

/** 交换两个位置的方块 */
function swap(board: Board, i: number, j: number): Board {
    const next = [...board];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
}

/** 通过模拟随机移动生成可解的打乱棋盘 */
function shuffleBoard(size: number): Board {
    let board = createSolvedBoard(size);
    let emptyIndex = getEmptyIndex(board);
    let lastMoveIndex = -1;

    for (let i = 0; i < SHUFFLE_MOVES; i++) {
        const movable = getMovableIndices(board, size).filter((idx) => idx !== lastMoveIndex);
        const target = movable[Math.floor(Math.random() * movable.length)];
        board = swap(board, emptyIndex, target);
        lastMoveIndex = emptyIndex;
        emptyIndex = target;
    }

    return board;
}

export interface UseSlidingPuzzleGameReturn {
    /** 当前棋盘 */
    board: Board;
    /** 棋盘尺寸 */
    size: number;
    /** 已走步数 */
    moves: number;
    /** 已用时间（秒） */
    time: number;
    /** 游戏状态 */
    status: GameStatus;
    /** 最佳记录 */
    bestRecord: BestRecord;
    /** 当前选中的方块索引 */
    selectedIndex: number | null;
    /** 是否可移动指定索引的方块 */
    canMove: (index: number) => boolean;
    /** 移动指定索引的方块 */
    moveTile: (index: number) => void;
    /** 选择方块（用于键盘操作） */
    selectTile: (index: number | null) => void;
    /** 重置并开始新游戏 */
    restart: () => void;
}

export function useSlidingPuzzleGame(config: GameConfig = DEFAULT_CONFIG): UseSlidingPuzzleGameReturn {
    const { size } = config;
    const [board, setBoard] = useState<Board>(() => shuffleBoard(size));
    const [moves, setMoves] = useState(0);
    const [time, setTime] = useState(0);
    const [status, setStatus] = useState<GameStatus>('idle');
    const [bestRecord, setBestRecord] = useState<BestRecord>({ moves: null, time: null });
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    /** 加载最佳记录 */
    useEffect(() => {
        setBestRecord(loadBestRecord());
    }, []);

    /** 清理计时器 */
    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    /** 启动计时器 */
    const startTimer = useCallback(() => {
        clearTimer();
        timerRef.current = setInterval(() => {
            setTime((prev) => prev + 1);
        }, 1000);
    }, [clearTimer]);

    /** 组件卸载时清理 */
    useEffect(() => {
        return () => clearTimer();
    }, [clearTimer]);

    /** 检查移动合法性 */
    const canMove = useCallback(
        (index: number): boolean => {
            if (status === 'won') return false;
            return getMovableIndices(board, size).includes(index);
        },
        [board, size, status]
    );

    /** 移动方块 */
    const moveTile = useCallback(
        (index: number) => {
            if (!canMove(index)) return;

            setBoard((prev) => {
                const emptyIndex = getEmptyIndex(prev);
                const next = swap(prev, emptyIndex, index);

                if (isBoardSolved(next)) {
                    setStatus('won');
                    clearTimer();
                } else if (status === 'idle') {
                    setStatus('playing');
                    startTimer();
                }

                return next;
            });

            setMoves((prev) => prev + 1);
            setSelectedIndex(null);
        },
        [canMove, status, startTimer, clearTimer]
    );

    /** 保存最佳记录 */
    useEffect(() => {
        if (status !== 'won') return;

        setBestRecord((prev) => {
            const next: BestRecord = {
                moves: prev.moves === null || moves < prev.moves ? moves : prev.moves,
                time: prev.time === null || time < prev.time ? time : prev.time,
            };
            saveBestRecord(next);
            return next;
        });
    }, [status, moves, time]);

    /** 选择方块 */
    const selectTile = useCallback((index: number | null) => {
        setSelectedIndex(index);
    }, []);

    /** 重新开始 */
    const restart = useCallback(() => {
        clearTimer();
        setBoard(shuffleBoard(size));
        setMoves(0);
        setTime(0);
        setStatus('idle');
        setSelectedIndex(null);
    }, [size, clearTimer]);

    return {
        board,
        size,
        moves,
        time,
        status,
        bestRecord,
        selectedIndex,
        canMove,
        moveTile,
        selectTile,
        restart,
    };
}
