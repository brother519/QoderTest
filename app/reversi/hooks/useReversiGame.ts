import { useCallback, useEffect, useRef, useState } from 'react';
import {
    BoardConfig,
    Cell,
    Difficulty,
    Disc,
    GameMode,
    MoveRecord,
    Player,
    ReversiStatus,
    Score,
} from '../types/game';
import { AI_THINKING_MS, DEFAULT_CONFIG } from '../constants/config';
import {
    applyMove,
    chooseAiMove,
    countScore,
    createInitialBoard,
    getLegalMoves,
    opponentOf,
} from '../utils/reversiRules';

interface UseReversiGameOptions {
    config?: BoardConfig;
    mode: GameMode;
    difficulty: Difficulty;
    /** 人机对战时玩家执子颜色 */
    humanColor: Player;
}

interface UseReversiGameReturn {
    board: Disc[][];
    currentPlayer: Player;
    status: ReversiStatus;
    winner: Player | null;
    score: Score;
    legalMoves: Cell[];
    lastMove: MoveRecord | null;
    aiThinking: boolean;
    /** 上一手因无棋可下而被跳过的玩家 */
    passInfo: Player | null;
    canUndo: boolean;
    start: () => void;
    restart: () => void;
    makeMove: (row: number, col: number) => boolean;
    undo: () => void;
}

export function useReversiGame(options: UseReversiGameOptions): UseReversiGameReturn {
    const { mode, difficulty, humanColor } = options;
    const config = options.config ?? DEFAULT_CONFIG;
    const { boardSize } = config;

    const [board, setBoard] = useState<Disc[][]>(() => createInitialBoard(boardSize));
    const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
    const [status, setStatus] = useState<ReversiStatus>('idle');
    const [winner, setWinner] = useState<Player | null>(null);
    const [history, setHistory] = useState<MoveRecord[]>([]);
    const [passInfo, setPassInfo] = useState<Player | null>(null);
    const [aiThinking, setAiThinking] = useState(false);

    const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearAiTimer = () => {
        if (aiTimerRef.current !== null) {
            clearTimeout(aiTimerRef.current);
            aiTimerRef.current = null;
        }
    };

    const settleGameEnd = useCallback((finalBoard: Disc[][]) => {
        const s = countScore(finalBoard);
        if (s.black > s.white) setWinner('black');
        else if (s.white > s.black) setWinner('white');
        else setWinner(null);
        setStatus(s.black === s.white ? 'draw' : 'won');
    }, []);

    const applyPlayerMove = useCallback(
        (currentBoard: Disc[][], row: number, col: number, player: Player): boolean => {
            const { board: next, flipped } = applyMove(currentBoard, row, col, player);
            if (flipped.length === 0) return false;

            const move: MoveRecord = { row, col, player, flipped };
            setBoard(next);
            setHistory((h) => [...h, move]);

            const nextPlayer = opponentOf(player);
            const nextMoves = getLegalMoves(next, nextPlayer);
            if (nextMoves.length > 0) {
                setPassInfo(null);
                setCurrentPlayer(nextPlayer);
                return true;
            }

            // 对手无棋可下，检查己方是否还能继续
            const selfMoves = getLegalMoves(next, player);
            if (selfMoves.length > 0) {
                setPassInfo(nextPlayer);
                setCurrentPlayer(player);
                return true;
            }

            settleGameEnd(next);
            return true;
        },
        [settleGameEnd]
    );

    const start = useCallback(() => {
        clearAiTimer();
        setBoard(createInitialBoard(boardSize));
        setCurrentPlayer('black');
        setStatus('playing');
        setWinner(null);
        setHistory([]);
        setPassInfo(null);
        setAiThinking(false);
    }, [boardSize]);

    const restart = useCallback(() => start(), [start]);

    const makeMove = useCallback(
        (row: number, col: number): boolean => {
            if (status !== 'playing') return false;
            if (aiThinking) return false;
            if (mode === 'pve' && currentPlayer !== humanColor) return false;
            return applyPlayerMove(board, row, col, currentPlayer);
        },
        [status, aiThinking, mode, currentPlayer, humanColor, board, applyPlayerMove]
    );

    const undo = useCallback(() => {
        if (status !== 'playing') return;
        if (history.length === 0) return;

        // pve 模式下悔一整轮：AI 那手 + 玩家那手
        const stepsToUndo = mode === 'pve' && history.length >= 2 ? 2 : 1;
        const restored = createInitialBoard(boardSize);
        const kept = history.slice(0, history.length - stepsToUndo);

        // 依次重放保留的走子
        let curBoard = restored;
        let curPlayer: Player = 'black';
        for (const move of kept) {
            const { board: next } = applyMove(curBoard, move.row, move.col, move.player);
            curBoard = next;
            const opp = opponentOf(move.player);
            const oppMoves = getLegalMoves(curBoard, opp);
            curPlayer = oppMoves.length > 0 ? opp : move.player;
        }

        clearAiTimer();
        setBoard(curBoard);
        setHistory(kept);
        setCurrentPlayer(kept.length === 0 ? 'black' : curPlayer);
        setPassInfo(null);
        setAiThinking(false);
    }, [status, history, mode, boardSize]);

    // AI 走子副作用
    useEffect(() => {
        if (status !== 'playing') return;
        if (mode !== 'pve') return;
        if (currentPlayer === humanColor) return;

        const legal = getLegalMoves(board, currentPlayer);
        if (legal.length === 0) return; // 交由 makeMove 中的分支处理

        setAiThinking(true);
        aiTimerRef.current = setTimeout(() => {
            const move = chooseAiMove(board, currentPlayer, difficulty);
            if (move) {
                applyPlayerMove(board, move.row, move.col, currentPlayer);
            }
            setAiThinking(false);
            aiTimerRef.current = null;
        }, AI_THINKING_MS);

        return () => clearAiTimer();
    }, [status, mode, currentPlayer, humanColor, board, difficulty, applyPlayerMove]);

    useEffect(() => clearAiTimer, []);

    const legalMoves = status === 'playing' ? getLegalMoves(board, currentPlayer) : [];
    const score = countScore(board);
    const lastMove = history.length > 0 ? history[history.length - 1] : null;
    const canUndo =
        status === 'playing' &&
        history.length > 0 &&
        !aiThinking &&
        (mode === 'pvp' || currentPlayer === humanColor);

    return {
        board,
        currentPlayer,
        status,
        winner,
        score,
        legalMoves,
        lastMove,
        aiThinking,
        passInfo,
        canUndo,
        start,
        restart,
        makeMove,
        undo,
    };
}
