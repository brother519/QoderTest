'use client';

/**
 * Light-bot 游戏状态 hook
 *
 * 状态机：playing -> running -> win | fail，win/fail 需 reset() 回到 playing。
 *
 * 说明：入参 `initialLevelIndex` 作为初始关卡下标；关卡切换既可由外部改变入参
 * 触发，也可调用返回的 `setLevelIndex`（内部持有关卡下标状态）。任一方式都会
 * 重置队列与运行状态。
 *
 * @module light-bot/hooks/useLightBotGame
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LEVELS, MAX_QUEUE_LENGTH, STEP_INTERVAL_MS } from '../constants/levels';
import { Command, LightBotStatus, Pos } from '../types/game';
import { createInitialState, executeStep, isWin, posKey } from '../engine/engine';

/** 把任意下标夹到合法关卡范围内 */
const normalizeIndex = (idx: number): number => (LEVELS[idx] ? idx : 0);

export function useLightBotGame(initialLevelIndex = 0) {
    const [levelIndex, setLevelIndexState] = useState(() => normalizeIndex(initialLevelIndex));

    const level = LEVELS[levelIndex] ?? LEVELS[0];

    const [queue, setQueue] = useState<Command[]>([]);
    const [status, setStatus] = useState<LightBotStatus>('playing');
    const [robot, setRobot] = useState<Pos>(() => ({ ...level.start }));
    const [litLamps, setLitLamps] = useState<string[]>([]);
    const [stepIndex, setStepIndex] = useState(-1);

    const timerRef = useRef<number | null>(null);

    const stopTimer = useCallback(() => {
        if (timerRef.current !== null) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const reset = useCallback(() => {
        stopTimer();
        setQueue([]);
        setStatus('playing');
        setRobot({ ...level.start });
        setLitLamps([]);
        setStepIndex(-1);
    }, [level.start, stopTimer]);

    // 外部入参变化时同步内部关卡下标（内部 setLevelIndex 不会触发本 effect）
    useEffect(() => {
        setLevelIndexState(normalizeIndex(initialLevelIndex));
    }, [initialLevelIndex]);

    // `reset` 的依赖 level.start 来自模块级常量，引用稳定，
    // 因此本 effect 仅在挂载与关卡切换时执行。
    useEffect(() => {
        reset();
    }, [reset]);

    useEffect(() => () => stopTimer(), [stopTimer]);

    const appendCommand = useCallback(
        (cmd: Command) => {
            if (status !== 'playing') return;
            setQueue((q) => (q.length >= MAX_QUEUE_LENGTH ? q : [...q, cmd]));
        },
        [status]
    );

    const removeAt = useCallback(
        (idx: number) => {
            if (status !== 'playing') return;
            setQueue((q) => q.filter((_, i) => i !== idx));
        },
        [status]
    );

    const undo = useCallback(() => {
        if (status !== 'playing') return;
        setQueue((q) => q.slice(0, -1));
    }, [status]);

    const clear = useCallback(() => {
        if (status !== 'playing') return;
        setQueue([]);
    }, [status]);

    const setLevelIndex = useCallback(
        (idx: number) => {
            stopTimer();
            setLevelIndexState(normalizeIndex(idx));
        },
        [stopTimer]
    );

    const run = useCallback(() => {
        if (status !== 'playing' || queue.length === 0) return;

        setStatus('running');
        let idx = 0;
        let engineState = createInitialState(level);

        setRobot({ ...engineState.robot });
        setLitLamps([]);

        timerRef.current = window.setInterval(() => {
            if (idx >= queue.length) {
                stopTimer();
                setStatus(isWin(engineState, level) ? 'win' : 'fail');
                setStepIndex(-1);
                return;
            }

            const cmd = queue[idx];
            const next = executeStep(engineState, cmd, level);

            if (!next) {
                stopTimer();
                setStatus('fail');
                setStepIndex(idx);
                return;
            }

            engineState = next;
            setRobot({ ...next.robot });
            setLitLamps([...next.litLamps]);
            setStepIndex(idx);
            idx += 1;
        }, STEP_INTERVAL_MS);
    }, [level, queue, status, stopTimer]);

    const litCount = useMemo(() => litLamps.length, [litLamps]);

    return {
        level,
        levelIndex,
        queue,
        status,
        robot,
        litLamps,
        litCount,
        stepIndex,
        appendCommand,
        removeAt,
        undo,
        clear,
        run,
        reset,
        setLevelIndex,
        posKey,
    };
}
