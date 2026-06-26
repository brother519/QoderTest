import { useCallback, useState } from 'react';
import { Stone, Player, GomokuStatus, MoveRecord, BoardConfig } from '../types/game';
import { DEFAULT_CONFIG } from '../constants/config';

interface UseGomokuGameReturn {
    board: Stone[][];
    currentPlayer: Player;
    status: GomokuStatus;
    winner: Player | null;
    moveCount: number;
    lastMove: MoveRecord | null;
    winLine: Array<{ row: number; col: number }> | null;
    start: () => void;
    restart: () => void;
    makeMove: (row: number, col: number) => boolean;
    undo: () => void;
}

function createEmptyBoard(size: number): Stone[][] {
    return Array.from({ length: size }, () => Array<Stone>(size).fill(null));
}

function checkWin(
    board: Stone[][],
    row: number,
    col: number,
    player: Player,
    winLength: number
): Array<{ row: number; col: number }> | null {
    const directions = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1],
    ];

    for (const [dr, dc] of directions) {
        const line: Array<{ row: number; col: number }> = [{ row, col }];

        // 正方向延伸
        for (let i = 1; i < winLength; i++) {
            const r = row + dr * i;
            const c = col + dc * i;
            if (r < 0 || r >= board.length || c < 0 || c >= board.length) break;
            if (board[r][c] !== player) break;
            line.push({ row: r, col: c });
        }

        // 反方向延伸
        for (let i = 1; i < winLength; i++) {
            const r = row - dr * i;
            const c = col - dc * i;
            if (r < 0 || r >= board.length || c < 0 || c >= board.length) break;
            if (board[r][c] !== player) break;
            line.push({ row: r, col: c });
        }

        if (line.length >= winLength) {
            return line;
        }
    }

    return null;
}

export function useGomokuGame(config: BoardConfig = DEFAULT_CONFIG): UseGomokuGameReturn {
    const { boardSize, winLength } = config;

    const [board, setBoard] = useState<Stone[][]>(() => createEmptyBoard(boardSize));
    const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
    const [status, setStatus] = useState<GomokuStatus>('idle');
    const [winner, setWinner] = useState<Player | null>(null);
    const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
    const [winLine, setWinLine] = useState<Array<{ row: number; col: number }> | null>(null);

    const start = useCallback(() => {
        setBoard(createEmptyBoard(boardSize));
        setCurrentPlayer('black');
        setStatus('playing');
        setWinner(null);
        setMoveHistory([]);
        setWinLine(null);
    }, [boardSize]);

    const restart = useCallback(() => {
        start();
    }, [start]);

    const makeMove = useCallback(
        (row: number, col: number): boolean => {
            if (status !== 'playing') return false;
            if (board[row][col] !== null) return false;

            const newBoard = board.map((r) => [...r]);
            newBoard[row][col] = currentPlayer;

            const move: MoveRecord = { row, col, player: currentPlayer };
            const newHistory = [...moveHistory, move];

            setBoard(newBoard);
            setMoveHistory(newHistory);

            // 检测胜利
            const line = checkWin(newBoard, row, col, currentPlayer, winLength);
            if (line) {
                setWinLine(line);
                setWinner(currentPlayer);
                setStatus('won');
                return true;
            }

            // 检测平局
            if (newHistory.length >= boardSize * boardSize) {
                setStatus('draw');
                return true;
            }

            setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
            return true;
        },
        [status, board, currentPlayer, moveHistory, winLength, boardSize]
    );

    const undo = useCallback(() => {
        if (status !== 'playing' || moveHistory.length === 0) return;

        const newHistory = moveHistory.slice(0, -1);
        const lastEntry = moveHistory[moveHistory.length - 1];

        const newBoard = board.map((r) => [...r]);
        newBoard[lastEntry.row][lastEntry.col] = null;

        setBoard(newBoard);
        setMoveHistory(newHistory);
        setCurrentPlayer(lastEntry.player);
        setWinLine(null);
        setWinner(null);
    }, [status, moveHistory, board]);

    return {
        board,
        currentPlayer,
        status,
        winner,
        moveCount: moveHistory.length,
        lastMove: moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : null,
        winLine,
        start,
        restart,
        makeMove,
        undo,
    };
}
