'use client';

/**
 * 点灯游戏核心逻辑 Hook
 *
 * @module lights-out/hooks/useLightsOutGame
 */

import { useState, useCallback, useMemo } from 'react';
import { LightsOutStatus } from '../types/game';
import { LEVELS } from '../constants/levels';

function cloneGrid(grid: boolean[][]): boolean[][] {
    return grid.map((row) => [...row]);
}

function isAllOff(grid: boolean[][]): boolean {
    return grid.every((row) => row.every((cell) => !cell));
}

export function useLightsOutGame(levelIndex: number) {
    const level = LEVELS[levelIndex];
    const size = level.size;

    const initialGrid = useMemo(() => cloneGrid(level.initial), [level]);

    const [grid, setGrid] = useState<boolean[][]>(() => cloneGrid(level.initial));
    const [moves, setMoves] = useState(0);
    const [status, setStatus] = useState<LightsOutStatus>('playing');

    const toggle = useCallback(
        (row: number, col: number) => {
            if (status === 'won') return;

            setGrid((prev) => {
                const next = cloneGrid(prev);

                const targets = [
                    [row, col],
                    [row - 1, col],
                    [row + 1, col],
                    [row, col - 1],
                    [row, col + 1],
                ];

                for (const [r, c] of targets) {
                    if (r >= 0 && r < size && c >= 0 && c < size) {
                        next[r][c] = !next[r][c];
                    }
                }

                if (isAllOff(next)) {
                    setStatus('won');
                }

                return next;
            });

            setMoves((m) => m + 1);
        },
        [size, status]
    );

    const reset = useCallback(() => {
        setGrid(cloneGrid(initialGrid));
        setMoves(0);
        setStatus('playing');
    }, [initialGrid]);

    const lightsOn = useMemo(
        () => grid.reduce((sum, row) => sum + row.filter(Boolean).length, 0),
        [grid]
    );

    return { grid, size, moves, status, lightsOn, toggle, reset };
}
