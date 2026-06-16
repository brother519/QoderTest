import { useState, useCallback, useRef, useEffect } from 'react';
import { GameStatus, Difficulty, GameConfig, TubeState, BestRecord } from '../types/game';
import {
    DIFFICULTY_CONFIGS,
    COLOR_KEYS,
    SHUFFLE_MOVES,
    BEST_RECORD_KEY_PREFIX,
} from '../constants/config';

function createSolvedState(config: GameConfig): TubeState[] {
    const tubes: TubeState[] = [];
    for (let i = 0; i < config.numColors; i++) {
        tubes.push({
            balls: Array(config.ballsPerTube).fill(COLOR_KEYS[i]),
            capacity: config.ballsPerTube,
        });
    }
    for (let i = 0; i < config.extraTubes; i++) {
        tubes.push({ balls: [], capacity: config.ballsPerTube });
    }
    return tubes;
}

function cloneTubes(tubes: TubeState[]): TubeState[] {
    return tubes.map((t) => ({ balls: [...t.balls], capacity: t.capacity }));
}

function getTopBall(tube: TubeState): string | null {
    return tube.balls.length > 0 ? tube.balls[tube.balls.length - 1] : null;
}

function canPlaceBall(tubes: TubeState[], fromIdx: number, toIdx: number): boolean {
    if (fromIdx === toIdx) return false;
    const from = tubes[fromIdx];
    const to = tubes[toIdx];
    if (from.balls.length === 0) return false;
    if (to.balls.length >= to.capacity) return false;
    const topBall = getTopBall(from);
    const destTop = getTopBall(to);
    if (destTop === null) return true;
    return topBall === destTop;
}

function executeMove(tubes: TubeState[], fromIdx: number, toIdx: number): TubeState[] {
    const next = cloneTubes(tubes);
    const ball = next[fromIdx].balls.pop()!;
    next[toIdx].balls.push(ball);
    return next;
}

function isSorted(tubes: TubeState[]): boolean {
    for (const tube of tubes) {
        if (tube.balls.length === 0) continue;
        if (tube.balls.length !== tube.capacity) return false;
        const color = tube.balls[0];
        if (!tube.balls.every((b) => b === color)) return false;
    }
    return true;
}

function shufflePuzzle(config: GameConfig): TubeState[] {
    let tubes = createSolvedState(config);
    let lastFrom = -1;
    let lastTo = -1;

    for (let i = 0; i < SHUFFLE_MOVES; i++) {
        const candidates: [number, number][] = [];
        for (let f = 0; f < tubes.length; f++) {
            if (tubes[f].balls.length === 0) continue;
            for (let t = 0; t < tubes.length; t++) {
                if (f === t) continue;
                if (f === lastTo && t === lastFrom) continue;
                if (canPlaceBall(tubes, f, t)) {
                    candidates.push([f, t]);
                }
            }
        }
        if (candidates.length === 0) break;
        const [f, t] = candidates[Math.floor(Math.random() * candidates.length)];
        tubes = executeMove(tubes, f, t);
        lastFrom = f;
        lastTo = t;
    }

    if (isSorted(tubes)) {
        return shufflePuzzle(config);
    }
    return tubes;
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

export interface UseColorSortGameReturn {
    tubes: TubeState[];
    config: GameConfig;
    selectedTube: number | null;
    moves: number;
    time: number;
    status: GameStatus;
    bestRecord: BestRecord;
    difficulty: Difficulty;
    canUndo: boolean;
    canPlace: (tubeIndex: number) => boolean;
    selectTube: (index: number) => void;
    undo: () => void;
    restart: () => void;
    setDifficulty: (d: Difficulty) => void;
}

export function useColorSortGame(initialDifficulty: Difficulty = 'easy'): UseColorSortGameReturn {
    const [difficulty, setDifficultyState] = useState<Difficulty>(initialDifficulty);
    const config = DIFFICULTY_CONFIGS[difficulty];

    const [tubes, setTubes] = useState<TubeState[]>(() => createSolvedState(config));
    const [selectedTube, setSelectedTube] = useState<number | null>(null);
    const [moves, setMoves] = useState(0);
    const [time, setTime] = useState(0);
    const [status, setStatus] = useState<GameStatus>('idle');
    const [history, setHistory] = useState<TubeState[][]>([]);
    const [bestRecord, setBestRecord] = useState<BestRecord>({ moves: null, time: null });
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        setTubes(shufflePuzzle(DIFFICULTY_CONFIGS[difficulty]));
        setBestRecord(loadBestRecord(difficulty));
        setInitialized(true);
    }, [difficulty]);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    const canPlace = useCallback(
        (tubeIndex: number): boolean => {
            if (selectedTube === null) return false;
            return canPlaceBall(tubes, selectedTube, tubeIndex);
        },
        [selectedTube, tubes],
    );

    const selectTube = useCallback(
        (index: number) => {
            if (status === 'won') return;

            if (selectedTube === null) {
                if (tubes[index].balls.length > 0) {
                    setSelectedTube(index);
                }
                return;
            }

            if (selectedTube === index) {
                setSelectedTube(null);
                return;
            }

            if (canPlaceBall(tubes, selectedTube, index)) {
                const snapshot = cloneTubes(tubes);
                const newTubes = executeMove(tubes, selectedTube, index);
                const newMoves = moves + 1;

                setHistory((h) => [...h, snapshot]);
                setTubes(newTubes);
                setMoves(newMoves);
                setSelectedTube(null);

                if (status === 'idle') {
                    setStatus('playing');
                    startTimer();
                }

                if (isSorted(newTubes)) {
                    setStatus('won');
                    clearTimer();
                }
            } else {
                setSelectedTube(null);
            }
        },
        [selectedTube, tubes, moves, status, startTimer, clearTimer],
    );

    const undo = useCallback(() => {
        if (status !== 'playing' || history.length === 0) return;
        const prev = history[history.length - 1];
        setHistory((h) => h.slice(0, -1));
        setTubes(prev);
        setMoves((m) => m - 1);
        setSelectedTube(null);
    }, [status, history]);

    const restart = useCallback(() => {
        clearTimer();
        setTubes(shufflePuzzle(config));
        setSelectedTube(null);
        setMoves(0);
        setTime(0);
        setStatus('idle');
        setHistory([]);
    }, [config, clearTimer]);

    const setDifficulty = useCallback(
        (d: Difficulty) => {
            clearTimer();
            setDifficultyState(d);
            setSelectedTube(null);
            setMoves(0);
            setTime(0);
            setStatus('idle');
            setHistory([]);
        },
        [clearTimer],
    );

    return {
        tubes,
        config,
        selectedTube,
        moves,
        time,
        status,
        bestRecord,
        difficulty,
        canUndo: history.length > 0 && status === 'playing',
        canPlace,
        selectTube,
        undo,
        restart,
        setDifficulty,
    };
}
