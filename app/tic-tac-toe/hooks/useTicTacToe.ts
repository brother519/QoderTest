'use client';

/**
 * 井字棋游戏核心逻辑 Hook
 *
 * 支持双人对战（PvP）和人机对战（PvE）两种模式。
 * PvE 模式使用 minimax 算法实现不可战胜的 AI。
 * 使用 useReducer 确保状态更新在 React Strict Mode 下安全可靠。
 *
 * @module tic-tac-toe/hooks/useTicTacToe
 */

import { useReducer, useCallback, useEffect } from 'react';
import { Cell, Player, TicTacToeStatus, GameMode, Difficulty } from '../types/game';
import { BOARD_SIZE } from '../constants/config';

const WINNING_LINES: [number, number][][] = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]],
];

function createEmptyBoard(): Cell[][] {
    return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

function checkWinner(board: Cell[][]): { winner: Player | null; line: [number, number][] | null } {
    for (const line of WINNING_LINES) {
        const cells = line.map(([r, c]) => board[r][c]);
        if (cells[0] !== null && cells[0] === cells[1] && cells[1] === cells[2]) {
            return { winner: cells[0] as Player, line };
        }
    }
    return { winner: null, line: null };
}

function isBoardFull(board: Cell[][]): boolean {
    return board.every((row) => row.every((cell) => cell !== null));
}

function getEmptyCells(board: Cell[][]): [number, number][] {
    const cells: [number, number][] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === null) cells.push([r, c]);
        }
    }
    return cells;
}

function evaluate(board: Cell[][]): number {
    const { winner } = checkWinner(board);
    if (winner === 'X') return 10;
    if (winner === 'O') return -10;
    return 0;
}

function minimax(board: Cell[][], depth: number, isMaximizing: boolean): number {
    const score = evaluate(board);
    if (score !== 0) return score;
    if (isBoardFull(board)) return 0;

    if (isMaximizing) {
        let best = -Infinity;
        for (const [r, c] of getEmptyCells(board)) {
            board[r][c] = 'X';
            best = Math.max(best, minimax(board, depth + 1, false));
            board[r][c] = null;
        }
        return best;
    } else {
        let best = Infinity;
        for (const [r, c] of getEmptyCells(board)) {
            board[r][c] = 'O';
            best = Math.min(best, minimax(board, depth + 1, true));
            board[r][c] = null;
        }
        return best;
    }
}

function getBestMove(board: Cell[][], aiMark: Player): [number, number] {
    const isMax = aiMark === 'X';
    let bestScore = isMax ? -Infinity : Infinity;
    let bestMove: [number, number] = [0, 0];

    for (const [r, c] of getEmptyCells(board)) {
        board[r][c] = aiMark;
        const score = minimax(board, 0, !isMax);
        board[r][c] = null;

        if (isMax ? score > bestScore : score < bestScore) {
            bestScore = score;
            bestMove = [r, c];
        }
    }
    return bestMove;
}

function getRandomMove(board: Cell[][]): [number, number] {
    const empty = getEmptyCells(board);
    return empty[Math.floor(Math.random() * empty.length)];
}

function getAIMove(board: Cell[][], aiMark: Player, difficulty: Difficulty): [number, number] {
    const copy = board.map((row) => [...row]);
    return difficulty === 'hard' ? getBestMove(copy, aiMark) : getRandomMove(copy);
}

interface GameState {
    board: Cell[][];
    currentPlayer: Player;
    status: TicTacToeStatus;
    winningLine: [number, number][] | null;
    winner: Player | null;
    wins: { X: number; O: number; draw: number };
}

type GameAction =
    | { type: 'MAKE_MOVE'; row: number; col: number; player: Player }
    | { type: 'RESET' };

function applyMove(state: GameState, row: number, col: number, player: Player): GameState {
    if (state.board[row][col] !== null || state.status !== 'playing') return state;

    const next = state.board.map((r) => [...r]);
    next[row][col] = player;

    const result = checkWinner(next);
    if (result.winner) {
        return {
            ...state,
            board: next,
            status: 'won',
            winner: result.winner,
            winningLine: result.line,
            wins: { ...state.wins, [result.winner]: state.wins[result.winner] + 1 },
        };
    }

    if (isBoardFull(next)) {
        return {
            ...state,
            board: next,
            status: 'over',
            wins: { ...state.wins, draw: state.wins.draw + 1 },
        };
    }

    return {
        ...state,
        board: next,
        currentPlayer: player === 'X' ? 'O' : 'X',
    };
}

function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'MAKE_MOVE':
            return applyMove(state, action.row, action.col, action.player);
        case 'RESET':
            return {
                ...state,
                board: createEmptyBoard(),
                currentPlayer: 'X',
                status: 'playing',
                winningLine: null,
                winner: null,
            };
        default:
            return state;
    }
}

function createInitialState(): GameState {
    return {
        board: createEmptyBoard(),
        currentPlayer: 'X',
        status: 'playing',
        winningLine: null,
        winner: null,
        wins: { X: 0, O: 0, draw: 0 },
    };
}

export function useTicTacToe(mode: GameMode, difficulty: Difficulty) {
    const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);

    const aiMark: Player = 'X';
    const humanMark: Player = 'O';
    const isAI = mode === 'pve';

    useEffect(() => {
        if (!isAI || state.currentPlayer !== aiMark || state.status !== 'playing') return;

        const timeout = setTimeout(() => {
            const [r, c] = getAIMove(state.board, aiMark, difficulty);
            dispatch({ type: 'MAKE_MOVE', row: r, col: c, player: aiMark });
        }, 400);

        return () => clearTimeout(timeout);
    }, [state.board, state.status, state.currentPlayer, mode, difficulty]);

    const makeMove = useCallback(
        (row: number, col: number) => {
            if (state.status !== 'playing') return;
            if (isAI && state.currentPlayer !== humanMark) return;
            dispatch({ type: 'MAKE_MOVE', row, col, player: state.currentPlayer });
        },
        [state.currentPlayer, state.status, isAI, humanMark],
    );

    const reset = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, []);

    return {
        board: state.board,
        currentPlayer: state.currentPlayer,
        status: state.status,
        winningLine: state.winningLine,
        winner: state.winner,
        wins: state.wins,
        isAI,
        aiMark,
        humanMark,
        makeMove,
        reset,
    };
}
