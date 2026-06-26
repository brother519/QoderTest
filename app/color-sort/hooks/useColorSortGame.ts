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

function shufflePuzzle(config: GameConfig, difficulty: Difficulty): TubeState[] {
    let tubes = createSolvedState(config);
    const recentMoves: [number, number][] = [];
    const maxHistory = 3;
    const moves = SHUFFLE_MOVES[difficulty];

    for (let i = 0; i < moves; i++) {
        const candidates: [number, number][] = [];
        for (let f = 0; f < tubes.length; f++) {
            if (tubes[f].balls.length === 0) continue;
            for (let t = 0; t < tubes.length; t++) {
                if (f === t) continue;
                const isReverse = recentMoves.some(([rf, rt]) => f === rt && t === rf);
                if (isReverse) continue;
                if (canPlaceBall(tubes, f, t)) {
                    candidates.push([f, t]);
                }
            }
        }
        if (candidates.length === 0) break;
        const [f, t] = candidates[Math.floor(Math.random() * candidates.length)];
        tubes = executeMove(tubes, f, t);
        recentMoves.push([f, t]);
        if (recentMoves.length > maxHistory) recentMoves.shift();
    }

    if (isSorted(tubes)) {
        return shufflePuzzle(config, difficulty);
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

/**
 * 颜色分拣游戏核心逻辑 Hook
 *
 * 管理游戏的所有状态与交互逻辑，包括：
 * - 试管状态与球的移动
 * - 计时器的启动与停止
 * - 撤销/重启操作
 * - 最佳记录的读取与保存
 * - 难度切换
 *
 * @param initialDifficulty 初始难度，默认为 'easy'
 * @returns UseColorSortGameReturn 游戏状态与操作方法集合
 */
export function useColorSortGame(initialDifficulty: Difficulty = 'easy'): UseColorSortGameReturn {
    const [difficulty, setDifficultyState] = useState<Difficulty>(initialDifficulty);
    const config = DIFFICULTY_CONFIGS[difficulty];

    // 所有试管的状态（初始为有序的已解决状态，等待 effect 随机打乱）
    const [tubes, setTubes] = useState<TubeState[]>(() => createSolvedState(config));
    // 当前被选中的试管下标，null 表示未选中任何试管
    const [selectedTube, setSelectedTube] = useState<number | null>(null);
    // 玩家已操作的移动步数
    const [moves, setMoves] = useState(0);
    // 游戏已用时（秒）
    const [time, setTime] = useState(0);
    // 游戏状态：'idle' | 'playing' | 'won'
    const [status, setStatus] = useState<GameStatus>('idle');
    // 操作历史快照，用于支持撤销功能
    const [history, setHistory] = useState<TubeState[][]>([]);
    // 当前难度下的历史最佳记录（步数 + 时间）
    const [bestRecord, setBestRecord] = useState<BestRecord>({ moves: null, time: null });
    // 标记是否已完成初始化（打乱谜题 + 加载最佳记录）
    const [initialized, setInitialized] = useState(false);

    // 难度变化时重新生成谜题并加载对应最佳记录
    useEffect(() => {
        setTubes(shufflePuzzle(DIFFICULTY_CONFIGS[difficulty], difficulty));
        setBestRecord(loadBestRecord(difficulty));
        setInitialized(true);
    }, [difficulty]);

    // 计时器 ref，避免在 state 更新时触发不必要的重渲染
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    /**
     * 启动计时器（每秒 +1），若已在运行则忽略
     */
    const startTimer = useCallback(() => {
        if (timerRef.current !== null) return;
        timerRef.current = setInterval(() => {
            setTime((t) => t + 1);
        }, 1000);
    }, []);

    /**
     * 清除计时器并重置 ref
     */
    const clearTimer = useCallback(() => {
        if (timerRef.current !== null) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // 组件卸载时自动清除计时器，防止内存泄漏
    useEffect(() => {
        return () => clearTimer();
    }, [clearTimer]);

    // 游戏胜利时更新并持久化最佳记录（步数和时间取历史最优）
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

    /**
     * 判断当前选中试管的顶部球是否可以放入指定试管
     * @param tubeIndex 目标试管下标
     * @returns 是否可放置
     */
    const canPlace = useCallback(
        (tubeIndex: number): boolean => {
            if (selectedTube === null) return false;
            return canPlaceBall(tubes, selectedTube, tubeIndex);
        },
        [selectedTube, tubes],
    );

    /**
     * 点击试管时的处理逻辑：
     * 1. 若无选中试管，则选中当前试管（非空才可选）
     * 2. 再次点击已选中试管，取消选中
     * 3. 点击其他试管且可放置，则执行移动；不可放置则取消选中
     * 4. 首次移动时启动计时器，完成排序时标记胜利并停止计时
     *
     * @param index 被点击的试管下标
     */
    const selectTube = useCallback(
        (index: number) => {
            // 游戏已胜利，不响应点击
            if (status === 'won') return;

            if (selectedTube === null) {
                // 首次选择：只有非空试管才可被选中
                if (tubes[index].balls.length > 0) {
                    setSelectedTube(index);
                }
                return;
            }

            if (selectedTube === index) {
                // 再次点击同一试管，取消选中
                setSelectedTube(null);
                return;
            }

            if (canPlaceBall(tubes, selectedTube, index)) {
                // 保存当前状态快照用于撤销
                const snapshot = cloneTubes(tubes);
                const newTubes = executeMove(tubes, selectedTube, index);
                const newMoves = moves + 1;

                setHistory((h) => [...h, snapshot]);
                setTubes(newTubes);
                setMoves(newMoves);
                setSelectedTube(null);

                // 首次移动时将状态从 idle 切换为 playing 并启动计时
                if (status === 'idle') {
                    setStatus('playing');
                    startTimer();
                }

                // 检测是否已全部排序完成
                if (isSorted(newTubes)) {
                    setStatus('won');
                    clearTimer();
                }
            } else {
                // 目标试管不可放置，取消选中
                setSelectedTube(null);
            }
        },
        [selectedTube, tubes, moves, status, startTimer, clearTimer],
    );

    /**
     * 撤销上一步操作：恢复历史快照，步数 -1
     * 仅在游戏进行中且有历史记录时可用
     */
    const undo = useCallback(() => {
        if (status !== 'playing' || history.length === 0) return;
        const prev = history[history.length - 1];
        setHistory((h) => h.slice(0, -1));
        setTubes(prev);
        setMoves((m) => m - 1);
        setSelectedTube(null);
    }, [status, history]);

    /**
     * 重新开始当前难度的游戏：
     * 停止计时，重新打乱谜题，重置所有状态
     */
    const restart = useCallback(() => {
        clearTimer();
        setTubes(shufflePuzzle(config, difficulty));
        setSelectedTube(null);
        setMoves(0);
        setTime(0);
        setStatus('idle');
        setHistory([]);
    }, [config, difficulty, clearTimer]);

    /**
     * 切换游戏难度：
     * 停止计时，更新难度状态（会触发 difficulty useEffect 重新生成谜题），重置所有进度
     *
     * @param d 目标难度
     */
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
        // 仅在游戏进行中且存在历史记录时，撤销功能才可用
        canUndo: history.length > 0 && status === 'playing',
        canPlace,
        selectTube,
        undo,
        restart,
        setDifficulty,
    };
}
