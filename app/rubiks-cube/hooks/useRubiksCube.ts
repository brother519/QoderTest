/**
 * 魔方游戏核心逻辑 Hook
 *
 * @module rubiks-cube/hooks/useRubiksCube
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CubeState, Move, UseRubiksCubeReturn, ViewAngles } from '../types/game';
import {
    applyMove,
    applyMoves,
    createSolvedCube,
    generateScrambleMoves,
    isSolved,
} from '../utils/cubeMoves';
import { INITIAL_VIEW } from '../constants/config';
import { useHighScore } from '@/lib/hooks/useHighScore';
import { GameStatus } from '@/lib/types/game';

/** 成功还原的基础分 */
const BASE_SCORE = 1000;

/** 每步惩罚分 */
const MOVE_PENALTY = 10;

/**
 * 计算本次还原得分
 */
function calculateScore(moves: number): number {
    return Math.max(0, BASE_SCORE - moves * MOVE_PENALTY);
}

/**
 * 魔方游戏 Hook
 */
export function useRubiksCube(): UseRubiksCubeReturn {
    const [cubeState, setCubeState] = useState<CubeState>(createSolvedCube);
    const [status, setStatus] = useState<GameStatus>('idle');
    const [moves, setMoves] = useState(0);
    const [time, setTime] = useState(0);
    const [viewAngles, setViewAngles] = useState<ViewAngles>(INITIAL_VIEW);
    const [isAnimating, setIsAnimating] = useState(false);
    const [pendingMove, setPendingMove] = useState<Move | null>(null);
    const [scrambleMoves, setScrambleMoves] = useState<Move[]>([]);
    const [highScore, updateHighScore] = useHighScore('rubiksCubeHighScore');

    const statusRef = useRef(status);
    statusRef.current = status;
    const movesRef = useRef(moves);
    movesRef.current = moves;

    /** 计时器 */
    useEffect(() => {
        if (status !== 'playing') return undefined;

        const interval = setInterval(() => {
            setTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [status]);

    /**
     * 执行一步操作（触发动画）
     */
    const handleApplyMove = useCallback(
        (move: Move) => {
            if (isAnimating || statusRef.current === 'won') return;

            if (statusRef.current === 'idle') {
                setStatus('playing');
            }

            setPendingMove(move);
            setIsAnimating(true);
        },
        [isAnimating]
    );

    /**
     * 动画结束，提交状态更新
     */
    const commitMove = useCallback(() => {
        if (!pendingMove) return;

        const move = pendingMove;
        setCubeState((prev) => {
            const next = applyMove(prev, move);

            if (isSolved(next)) {
                const currentMoves = movesRef.current + 1;
                const score = calculateScore(currentMoves);
                updateHighScore(score);
                setStatus('won');
            }

            return next;
        });
        setMoves((prev) => prev + 1);
        setPendingMove(null);
        setIsAnimating(false);
    }, [pendingMove, updateHighScore]);

    /**
     * 打乱魔方
     */
    const scramble = useCallback(() => {
        const movesList = generateScrambleMoves();
        const nextState = applyMoves(createSolvedCube(), movesList);

        setCubeState(nextState);
        setStatus('playing');
        setMoves(0);
        setTime(0);
        setPendingMove(null);
        setIsAnimating(false);
        setScrambleMoves(movesList);
    }, []);

    /**
     * 重置为还原态
     */
    const reset = useCallback(() => {
        setCubeState(createSolvedCube());
        setStatus('idle');
        setMoves(0);
        setTime(0);
        setPendingMove(null);
        setIsAnimating(false);
        setScrambleMoves([]);
    }, []);

    /**
     * 更新视角角度（限制俯仰角避免万向节锁）
     */
    const handleSetViewAngles = useCallback((angles: ViewAngles) => {
        setViewAngles({
            rx: Math.max(-90, Math.min(90, angles.rx)),
            ry: angles.ry,
        });
    }, []);

    return {
        cubeState,
        status,
        moves,
        time,
        viewAngles,
        isAnimating,
        pendingMove,
        scrambleMoves,
        highScore,
        applyMove: handleApplyMove,
        commitMove,
        scramble,
        reset,
        setViewAngles: handleSetViewAngles,
    };
}
