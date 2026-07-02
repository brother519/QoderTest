/**
 * 黑白棋核心规则
 *
 * 提供纯函数式的棋盘操作、合法落子判定、翻转结算与 AI 决策。
 * 所有函数不修改传入的棋盘，返回新棋盘。
 *
 * @module app/reversi/utils/reversiRules
 */

import { Cell, Difficulty, Disc, Player, Score } from '../types/game';
import { DIRECTIONS, POSITION_WEIGHTS } from '../constants/config';

/** 生成空棋盘并放置初始 4 子 */
export function createInitialBoard(size: number): Disc[][] {
    const board: Disc[][] = Array.from({ length: size }, () =>
        Array<Disc>(size).fill(null)
    );
    const mid = Math.floor(size / 2);
    board[mid - 1][mid - 1] = 'white';
    board[mid][mid] = 'white';
    board[mid - 1][mid] = 'black';
    board[mid][mid - 1] = 'black';
    return board;
}

export function opponentOf(player: Player): Player {
    return player === 'black' ? 'white' : 'black';
}

/** 计算在 (row,col) 落子后每个方向能翻转的对手棋子 */
export function getFlippedDiscs(
    board: Disc[][],
    row: number,
    col: number,
    player: Player
): Cell[] {
    if (board[row]?.[col] !== null) return [];

    const size = board.length;
    const opponent = opponentOf(player);
    const flipped: Cell[] = [];

    for (const [dr, dc] of DIRECTIONS) {
        const line: Cell[] = [];
        let r = row + dr;
        let c = col + dc;

        while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === opponent) {
            line.push({ row: r, col: c });
            r += dr;
            c += dc;
        }

        // 只有当对手棋子链末端紧邻己方棋子时才有效
        if (line.length > 0 && r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player) {
            flipped.push(...line);
        }
    }

    return flipped;
}

export function isLegalMove(board: Disc[][], row: number, col: number, player: Player): boolean {
    return getFlippedDiscs(board, row, col, player).length > 0;
}

/** 列出当前玩家所有合法落子点 */
export function getLegalMoves(board: Disc[][], player: Player): Cell[] {
    const size = board.length;
    const moves: Cell[] = [];
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (isLegalMove(board, row, col, player)) {
                moves.push({ row, col });
            }
        }
    }
    return moves;
}

/**
 * 应用一次落子，返回新棋盘和被翻转的棋子列表。
 * 若落子非法，flipped 为空数组，棋盘保持不变。
 */
export function applyMove(
    board: Disc[][],
    row: number,
    col: number,
    player: Player
): { board: Disc[][]; flipped: Cell[] } {
    const flipped = getFlippedDiscs(board, row, col, player);
    if (flipped.length === 0) {
        return { board, flipped };
    }
    const next = board.map((r) => [...r]);
    next[row][col] = player;
    for (const { row: r, col: c } of flipped) {
        next[r][c] = player;
    }
    return { board: next, flipped };
}

export function countScore(board: Disc[][]): Score {
    let black = 0;
    let white = 0;
    for (const row of board) {
        for (const cell of row) {
            if (cell === 'black') black++;
            else if (cell === 'white') white++;
        }
    }
    return { black, white };
}

/**
 * 从当前玩家角度评估局面。
 * 综合位置权重、行动力(合法步数差)与角控制。
 */
function evaluate(board: Disc[][], player: Player): number {
    const size = board.length;
    const opponent = opponentOf(player);

    let positional = 0;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const disc = board[r][c];
            if (disc === player) positional += POSITION_WEIGHTS[r][c];
            else if (disc === opponent) positional -= POSITION_WEIGHTS[r][c];
        }
    }

    const myMoves = getLegalMoves(board, player).length;
    const oppMoves = getLegalMoves(board, opponent).length;
    const mobility = myMoves - oppMoves;

    return positional + mobility * 4;
}

/**
 * AI 选点。
 * - easy: 随机合法落子
 * - medium: 一步贪心，取评估最高
 * - hard: minimax + alpha-beta，深度 4
 */
export function chooseAiMove(
    board: Disc[][],
    player: Player,
    difficulty: Difficulty
): Cell | null {
    const moves = getLegalMoves(board, player);
    if (moves.length === 0) return null;

    if (difficulty === 'easy') {
        // 决定性顺序，避免 Math.random；使用棋盘子数做 pseudo-shuffle
        const { black, white } = countScore(board);
        const idx = (black * 31 + white * 17) % moves.length;
        return moves[idx];
    }

    if (difficulty === 'medium') {
        let bestScore = -Infinity;
        let best: Cell = moves[0];
        for (const move of moves) {
            const { board: next } = applyMove(board, move.row, move.col, player);
            const score = evaluate(next, player);
            if (score > bestScore) {
                bestScore = score;
                best = move;
            }
        }
        return best;
    }

    return minimaxRoot(board, player, 4);
}

function minimaxRoot(board: Disc[][], player: Player, depth: number): Cell {
    const moves = getLegalMoves(board, player);
    let bestScore = -Infinity;
    let best: Cell = moves[0];
    for (const move of moves) {
        const { board: next } = applyMove(board, move.row, move.col, player);
        const score = minimax(next, opponentOf(player), player, depth - 1, -Infinity, Infinity, false);
        if (score > bestScore) {
            bestScore = score;
            best = move;
        }
    }
    return best;
}

function minimax(
    board: Disc[][],
    turn: Player,
    root: Player,
    depth: number,
    alpha: number,
    beta: number,
    maximizing: boolean
): number {
    if (depth === 0) {
        return evaluate(board, root);
    }

    const moves = getLegalMoves(board, turn);
    if (moves.length === 0) {
        // 己方无子可下，若对方也无则终局
        const oppMoves = getLegalMoves(board, opponentOf(turn));
        if (oppMoves.length === 0) {
            return evaluate(board, root);
        }
        return minimax(board, opponentOf(turn), root, depth - 1, alpha, beta, !maximizing);
    }

    if (maximizing) {
        let value = -Infinity;
        for (const move of moves) {
            const { board: next } = applyMove(board, move.row, move.col, turn);
            value = Math.max(
                value,
                minimax(next, opponentOf(turn), root, depth - 1, alpha, beta, false)
            );
            alpha = Math.max(alpha, value);
            if (alpha >= beta) break;
        }
        return value;
    }

    let value = Infinity;
    for (const move of moves) {
        const { board: next } = applyMove(board, move.row, move.col, turn);
        value = Math.min(
            value,
            minimax(next, opponentOf(turn), root, depth - 1, alpha, beta, true)
        );
        beta = Math.min(beta, value);
        if (alpha >= beta) break;
    }
    return value;
}
