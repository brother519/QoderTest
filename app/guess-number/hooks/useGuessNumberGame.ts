'use client';

/**
 * 猜数字游戏核心逻辑 Hook
 *
 * 管理密码生成、猜测验证、游戏状态转换等核心逻辑。
 *
 * @module guess-number/hooks/useGuessNumberGame
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { GuessNumberStatus, Difficulty, GuessResult } from '../types/game';
import { DIFFICULTY_CONFIGS, HIGH_SCORE_KEY_PREFIX } from '../constants/config';

/** 生成不重复数字的密码 */
function generateSecret(codeLength: number, digitRange: number): string {
    const digits: number[] = [];
    const available = Array.from({ length: digitRange }, (_, i) => i);

    for (let i = 0; i < codeLength; i++) {
        const idx = Math.floor(Math.random() * available.length);
        digits.push(available[idx]);
        available.splice(idx, 1);
    }

    return digits.join('');
}

/** 计算猜测结果：几A几B */
function evaluate(secret: string, guess: string): { bulls: number; cows: number } {
    let bulls = 0;
    let cows = 0;

    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === secret[i]) {
            bulls++;
        } else if (secret.includes(guess[i])) {
            cows++;
        }
    }

    return { bulls, cows };
}

/** 从 localStorage 加载最佳记录 */
function loadBestScore(difficulty: Difficulty): number | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(HIGH_SCORE_KEY_PREFIX + difficulty);
        if (raw) return parseInt(raw, 10);
    } catch {
        // ignore
    }
    return null;
}

/** 保存最佳记录到 localStorage */
function saveBestScore(difficulty: Difficulty, score: number): void {
    try {
        localStorage.setItem(HIGH_SCORE_KEY_PREFIX + difficulty, String(score));
    } catch {
        // ignore
    }
}

export interface UseGuessNumberGameReturn {
    status: GuessNumberStatus;
    history: GuessResult[];
    attempts: number;
    maxAttempts: number;
    codeLength: number;
    digitRange: number;
    difficulty: Difficulty;
    bestScore: number | null;
    time: number;
    secret: string | null;
    makeGuess: (guess: string) => boolean;
    restart: () => void;
    setDifficulty: (d: Difficulty) => void;
}

export function useGuessNumberGame(initialDifficulty: Difficulty = 'medium'): UseGuessNumberGameReturn {
    const [difficulty, setDifficultyState] = useState<Difficulty>(initialDifficulty);
    const config = DIFFICULTY_CONFIGS[difficulty];

    const [secret, setSecret] = useState<string>('');
    const [history, setHistory] = useState<GuessResult[]>([]);
    const [status, setStatus] = useState<GuessNumberStatus>('idle');
    const [bestScore, setBestScore] = useState<number | null>(null);
    const [time, setTime] = useState(0);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // 初始化
    useEffect(() => {
        const cfg = DIFFICULTY_CONFIGS[difficulty];
        setSecret(generateSecret(cfg.codeLength, cfg.digitRange));
        setBestScore(loadBestScore(difficulty));
    }, [difficulty]);

    const startTimer = useCallback(() => {
        if (timerRef.current !== null) return;
        timerRef.current = setInterval(() => {
            setTime((t) => t + 1);
        }, 1000);
    }, []);

    const clearTimer = useCallback(() => {
        if (timerRef.current !== null) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => clearTimer();
    }, [clearTimer]);

    const makeGuess = useCallback(
        (guess: string): boolean => {
            if (status === 'won' || status === 'lost') return false;
            if (guess.length !== config.codeLength) return false;

            // 验证输入合法性：无重复数字且在范围内
            const digits = new Set(guess.split(''));
            if (digits.size !== config.codeLength) return false;
            for (const d of guess) {
                if (parseInt(d, 10) >= config.digitRange) return false;
            }

            if (status === 'idle') {
                setStatus('playing');
                startTimer();
            }

            const { bulls, cows } = evaluate(secret, guess);
            const result: GuessResult = { guess, bulls, cows };

            const newHistory = [...history, result];
            setHistory(newHistory);

            if (bulls === config.codeLength) {
                setStatus('won');
                clearTimer();
                const score = newHistory.length;
                setBestScore((prev) => {
                    const best = prev === null || score < prev ? score : prev;
                    saveBestScore(difficulty, best);
                    return best;
                });
            } else if (newHistory.length >= config.maxAttempts) {
                setStatus('lost');
                clearTimer();
            }

            return true;
        },
        [status, config, secret, history, difficulty, startTimer, clearTimer],
    );

    const restart = useCallback(() => {
        clearTimer();
        const cfg = DIFFICULTY_CONFIGS[difficulty];
        setSecret(generateSecret(cfg.codeLength, cfg.digitRange));
        setHistory([]);
        setStatus('idle');
        setTime(0);
    }, [difficulty, clearTimer]);

    const setDifficulty = useCallback(
        (d: Difficulty) => {
            clearTimer();
            setDifficultyState(d);
            setHistory([]);
            setStatus('idle');
            setTime(0);
        },
        [clearTimer],
    );

    return {
        status,
        history,
        attempts: history.length,
        maxAttempts: config.maxAttempts,
        codeLength: config.codeLength,
        digitRange: config.digitRange,
        difficulty,
        bestScore,
        time,
        secret: status === 'won' || status === 'lost' ? secret : null,
        makeGuess,
        restart,
        setDifficulty,
    };
}
