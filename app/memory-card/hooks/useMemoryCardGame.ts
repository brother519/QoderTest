import { useState, useCallback, useRef, useEffect } from 'react';
import { GameStatus, Difficulty, GameConfig, CardItem, BestRecord } from '../types/game';
import {
    DIFFICULTY_CONFIGS,
    EMOJI_POOL,
    FLIP_DELAY,
    BEST_RECORD_KEY_PREFIX,
} from '../constants/config';

function shuffleArray<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function createCards(difficulty: Difficulty): CardItem[] {
    const config = DIFFICULTY_CONFIGS[difficulty];
    const emojis = shuffleArray(EMOJI_POOL).slice(0, config.pairs);
    const pairs = [...emojis, ...emojis];
    const shuffled = shuffleArray(pairs);
    return shuffled.map((emoji, i) => ({
        id: i,
        emoji,
        flipped: false,
        matched: false,
    }));
}

function loadBestRecord(difficulty: Difficulty): BestRecord {
    if (typeof window === 'undefined') return { moves: null, time: null };
    try {
        const raw = localStorage.getItem(BEST_RECORD_KEY_PREFIX + difficulty);
        if (raw) return JSON.parse(raw);
    } catch {
        // ignore
    }
    return { moves: null, time: null };
}

function saveBestRecord(difficulty: Difficulty, record: BestRecord): void {
    try {
        localStorage.setItem(BEST_RECORD_KEY_PREFIX + difficulty, JSON.stringify(record));
    } catch {
        // ignore
    }
}

export interface UseMemoryCardReturn {
    cards: CardItem[];
    config: GameConfig;
    moves: number;
    time: number;
    combo: number;
    maxCombo: number;
    status: GameStatus;
    bestRecord: BestRecord;
    difficulty: Difficulty;
    disabled: boolean;
    mounted: boolean;
    flipCard: (id: number) => void;
    restart: () => void;
    setDifficulty: (d: Difficulty) => void;
}

export function useMemoryCard(initialDifficulty: Difficulty = 'easy'): UseMemoryCardReturn {
    const [difficulty, setDifficultyState] = useState<Difficulty>(initialDifficulty);
    const [cards, setCards] = useState<CardItem[]>([]);
    const [moves, setMoves] = useState(0);
    const [time, setTime] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [status, setStatus] = useState<GameStatus>('idle');
    const [bestRecord, setBestRecord] = useState<BestRecord>({ moves: null, time: null });
    const [disabled, setDisabled] = useState(false);
    const [mounted, setMounted] = useState(false);

    const flippedRef = useRef<{ id: number; emoji: string }[]>([]);
    const matchedCountRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const comboRef = useRef(0);

    useEffect(() => {
        setCards(createCards(difficulty));
        setBestRecord(loadBestRecord(difficulty));
        matchedCountRef.current = 0;
        comboRef.current = 0;
        flippedRef.current = [];
        setMounted(true);
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

    useEffect(() => {
        if (status !== 'won') return;
        setBestRecord((prev) => {
            const next: BestRecord = {
                moves:
                    prev.moves === null || moves < prev.moves ? moves : prev.moves,
                time: prev.time === null || time < prev.time ? time : prev.time,
            };
            saveBestRecord(difficulty, next);
            return next;
        });
    }, [status, moves, time, difficulty]);

    const flipCard = useCallback(
        (id: number) => {
            if (disabled || status === 'won') return;
            const card = cards[id];
            if (!card || card.flipped || card.matched) return;
            if (flippedRef.current.length >= 2) return;

            if (status === 'idle') {
                setStatus('playing');
                startTimer();
            }

            flippedRef.current.push({ id, emoji: card.emoji });

            setCards((prev) =>
                prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)),
            );

            if (flippedRef.current.length === 2) {
                setMoves((m) => m + 1);
                setDisabled(true);

                const first = flippedRef.current[0];
                const second = flippedRef.current[1];
                const isMatch = first.emoji === second.emoji;

                setTimeout(() => {
                    if (isMatch) {
                        comboRef.current += 1;
                        const newCombo = comboRef.current;
                        setCombo(newCombo);
                        setMaxCombo((mc) => Math.max(mc, newCombo));

                        matchedCountRef.current += 1;
                        const config = DIFFICULTY_CONFIGS[difficulty];
                        if (matchedCountRef.current === config.pairs) {
                            setStatus('won');
                            clearTimer();
                        }

                        setCards((prev) =>
                            prev.map((c) =>
                                c.id === first.id || c.id === second.id
                                    ? { ...c, matched: true }
                                    : c,
                            ),
                        );
                    } else {
                        comboRef.current = 0;
                        setCombo(0);

                        setCards((prev) =>
                            prev.map((c) =>
                                c.id === first.id || c.id === second.id
                                    ? { ...c, flipped: false }
                                    : c,
                            ),
                        );
                    }

                    flippedRef.current = [];
                    setDisabled(false);
                }, FLIP_DELAY);
            }
        },
        [cards, disabled, status, difficulty, startTimer, clearTimer],
    );

    const restart = useCallback(() => {
        clearTimer();
        setCards(createCards(difficulty));
        setMoves(0);
        setTime(0);
        setCombo(0);
        setMaxCombo(0);
        setStatus('idle');
        setDisabled(false);
        flippedRef.current = [];
        matchedCountRef.current = 0;
        comboRef.current = 0;
    }, [difficulty, clearTimer]);

    const setDifficulty = useCallback(
        (d: Difficulty) => {
            clearTimer();
            setDifficultyState(d);
            setMoves(0);
            setTime(0);
            setCombo(0);
            setMaxCombo(0);
            setStatus('idle');
            setDisabled(false);
            flippedRef.current = [];
            matchedCountRef.current = 0;
            comboRef.current = 0;
        },
        [clearTimer],
    );

    return {
        cards,
        config: DIFFICULTY_CONFIGS[difficulty],
        moves,
        time,
        combo,
        maxCombo,
        status,
        bestRecord,
        difficulty,
        disabled,
        mounted,
        flipCard,
        restart,
        setDifficulty,
    };
}
