/**
 * Hanoi Tower Game Logic Hook
 *
 * @module hanoi/hooks/useHanoiGame
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { HanoiState, ModeStats, PegIndex, GameStatus } from '../types/game';
import { HANOI_CONFIG, STORAGE_KEY } from '../constants/config';

/** 获取初始状态 */
function getInitialState(level: number): HanoiState {
    const pegs: number[][] = [[], [], []];
    // 初始状态：所有圆盘在左边柱子 (从大到小)
    for (let i = level; i >= 1; i--) {
        pegs[0].push(i);
    }
    return {
        pegs,
        moveCount: 0,
        startTime: Date.now(),
        status: 'playing' as GameStatus,
        selectedPeg: null,
        level,
        mode: 'classic' as const,
        pegCount: 3,
    };
}

/** 从 localStorage 加载统计 */
function loadStats(): ModeStats {
    const fallback: ModeStats = { unlockedLevels: 3, bestMoves: {}, totalGames: 0, totalTime: 0 };
    if (typeof window === 'undefined') return fallback;
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return fallback;
        const parsed = JSON.parse(saved);
        return { ...parsed, unlockedLevels: Math.max(3, parsed.unlockedLevels || 3) };
    } catch {
        return fallback;
    }
}

/** 保存统计到 localStorage */
function saveStats(stats: ModeStats): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
        // 静默忽略写入失败（如存储配额满或隐私模式）
    }
}

/** 检查游戏是否完成 */
function checkComplete(pegs: number[][], level: number): boolean {
    return pegs[2].length === level;
}

/** 计算最优步数 (2^n - 1) */
export function getOptimalMoves(level: number): number {
    return Math.pow(2, level) - 1;
}

export function useHanoiGame() {
    const [state, setState] = useState<HanoiState>(() => getInitialState(3));
    const [stats, setStats] = useState<ModeStats>(loadStats);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // 计时器
    useEffect(() => {
        if (state.status === 'playing') {
            timerRef.current = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - state.startTime) / 1000));
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [state.status, state.startTime]);

    // 保存统计
    useEffect(() => {
        saveStats(stats);
    }, [stats]);

    /** 开始新游戏 */
    const startGame = useCallback((level: number) => {
        setState(getInitialState(level));
        setElapsedTime(0);
    }, []);

    /** 重置当前游戏 */
    const resetGame = useCallback(() => {
        setState(getInitialState(state.level));
        setElapsedTime(0);
    }, [state.level]);

    /** 暂停/继续 */
    const togglePause = useCallback(() => {
        setState(prev => ({
            ...prev,
            status: prev.status === 'playing' ? 'paused' : 'playing',
        }));
    }, []);

    /** 移动圆盘 */
    const moveDisk = useCallback((fromPeg: PegIndex, toPeg: PegIndex): boolean => {
        if (fromPeg === toPeg) return false;
        if (state.status !== 'playing') return false;

        const fromDisks = state.pegs[fromPeg];
        const toDisks = state.pegs[toPeg];

        if (fromDisks.length === 0) return false;

        const disk = fromDisks[fromDisks.length - 1];
        const topDisk = toDisks[toDisks.length - 1];

        // 只能把小圆盘放到大圆盘上
        if (topDisk && disk > topDisk) return false;

        const newPegs = state.pegs.map((peg, i) => {
            if (i === fromPeg) return peg.slice(0, -1);
            if (i === toPeg) return [...peg, disk];
            return peg;
        });

        const newMoveCount = state.moveCount + 1;
        const isComplete = checkComplete(newPegs, state.level);

        setState(prev => ({
            ...prev,
            pegs: newPegs as number[][],
            moveCount: newMoveCount,
            status: isComplete ? 'completed' : prev.status,
            selectedPeg: null,
        }));

        // 游戏完成时更新统计
        if (isComplete) {
            setStats(prev => {
                const newBestMoves = { ...prev.bestMoves };
                const currentBest = newBestMoves[state.level];
                if (!currentBest || newMoveCount < currentBest) {
                    newBestMoves[state.level] = newMoveCount;
                }
                return {
                    ...prev,
                    unlockedLevels: Math.max(prev.unlockedLevels, state.level + 1),
                    bestMoves: newBestMoves,
                    totalGames: prev.totalGames + 1,
                    totalTime: prev.totalTime + elapsedTime,
                };
            });
        }

        return true;
    }, [state.pegs, state.status, state.level, elapsedTime]);

    /** 选择柱子 (点击模式) */
    const selectPeg = useCallback((pegIndex: PegIndex) => {
        if (state.status !== 'playing') return;

        if (state.selectedPeg === null) {
            // 选择源柱子
            if (state.pegs[pegIndex].length > 0) {
                setState(prev => ({ ...prev, selectedPeg: pegIndex }));
            }
        } else if (state.selectedPeg === pegIndex) {
            // 取消选择
            setState(prev => ({ ...prev, selectedPeg: null }));
        } else {
            // 移动到目标柱子
            moveDisk(state.selectedPeg, pegIndex);
        }
    }, [state.selectedPeg, state.pegs, state.status, moveDisk]);

    return {
        state,
        stats,
        elapsedTime,
        startGame,
        resetGame,
        togglePause,
        moveDisk,
        selectPeg,
    };
}
