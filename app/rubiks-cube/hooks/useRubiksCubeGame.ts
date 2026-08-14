/**
 * 魔方游戏核心逻辑 Hook
 *
 * @module rubiks-cube/hooks/useRubiksCubeGame
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CubeState, Move, UseRubiksCubeGameReturn, ViewAngles } from '../types/game';
import {
    applyMove,
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
export function useRubiksCubeGame(): UseRubiksCubeGameReturn {
    const [cubeState, setCubeState] = useState<CubeState>(createSolvedCube);
    const [status, setStatus] = useState<GameStatus>('idle');
    const [moves, setMoves] = useState(0);
    const [time, setTime] = useState(0);
    const [viewAngles, setViewAngles] = useState<ViewAngles>(INITIAL_VIEW);
    const [isAnimating, setIsAnimating] = useState(false);
    const [pendingMove, setPendingMove] = useState<Move | null>(null);
    const [scrambleMoves, setScrambleMoves] = useState<Move[]>([]);
    const [isScrambling, setIsScrambling] = useState(false);
    const [hoveredMove, setHoveredMove] = useState<Move | null>(null);
    const [highScore, updateHighScore] = useHighScore('rubiksCubeHighScore');

    const statusRef = useRef(status);
    statusRef.current = status;
    const movesRef = useRef(moves);
    movesRef.current = moves;
    const scrambleQueueRef = useRef<Move[]>([]);
    const scrambleIndexRef = useRef(0);

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
     * Commit the pending move. If scrambling, continue with the next queued move.
     */
    const commitMove = useCallback(() => {
        if (!pendingMove) return;

        const move = pendingMove;
        setCubeState((prev) => {
            const next = applyMove(prev, move);

            if (!isScrambling && isSolved(next)) {
                const currentMoves = movesRef.current + 1;
                const score = calculateScore(currentMoves);
                updateHighScore(score);
                setStatus('won');
            }

            return next;
        });

        if (!isScrambling) {
            setMoves((prev) => prev + 1);
        }

        if (scrambleIndexRef.current < scrambleQueueRef.current.length) {
            const nextMove = scrambleQueueRef.current[scrambleIndexRef.current];
            scrambleIndexRef.current++;
            setPendingMove(nextMove);
        } else {
            setPendingMove(null);
            setIsAnimating(false);
            if (isScrambling) {
                setIsScrambling(false);
            }
        }
    }, [pendingMove, isScrambling, updateHighScore]);

    /**
     * Scramble the cube by playing a random sequence of moves with animation.
     * The number of moves is random between 20 and 30.
     */
    const scramble = useCallback(() => {
        const count = Math.floor(Math.random() * 11) + 20;
        const movesList = generateScrambleMoves(count);

        setCubeState(createSolvedCube());
        setStatus('playing');
        setMoves(0);
        setTime(0);
        setScrambleMoves(movesList);
        scrambleQueueRef.current = movesList;
        scrambleIndexRef.current = 1;
        setIsScrambling(true);

        if (movesList.length > 0) {
            setPendingMove(movesList[0]);
            setIsAnimating(true);
        } else {
            setIsScrambling(false);
        }
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
        scrambleQueueRef.current = [];
        scrambleIndexRef.current = 0;
        setIsScrambling(false);
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
        setViewAngles,
        hoveredMove,
        setHoveredMove,
    };
}
