import {
    applyMove,
    countScore,
    createInitialBoard,
    getFlippedDiscs,
    getLegalMoves,
    isLegalMove,
    opponentOf,
    chooseAiMove,
} from '../reversiRules';
import { Disc, Player } from '../../types/game';

const BOARD_SIZE = 8;

describe('reversiRules', () => {
    describe('createInitialBoard', () => {
        it('places the four center discs correctly', () => {
            const board = createInitialBoard(BOARD_SIZE);
            expect(board[3][3]).toBe('white');
            expect(board[4][4]).toBe('white');
            expect(board[3][4]).toBe('black');
            expect(board[4][3]).toBe('black');
            const score = countScore(board);
            expect(score).toEqual({ black: 2, white: 2 });
        });
    });

    describe('opponentOf', () => {
        it('returns the opposite color', () => {
            expect(opponentOf('black')).toBe('white');
            expect(opponentOf('white')).toBe('black');
        });
    });

    describe('getLegalMoves / isLegalMove', () => {
        it('black has exactly 4 opening moves', () => {
            const board = createInitialBoard(BOARD_SIZE);
            const moves = getLegalMoves(board, 'black');
            expect(moves).toHaveLength(4);
            const set = new Set(moves.map((m) => `${m.row},${m.col}`));
            expect(set).toEqual(new Set(['2,3', '3,2', '4,5', '5,4']));
        });

        it('rejects moves on occupied squares', () => {
            const board = createInitialBoard(BOARD_SIZE);
            expect(isLegalMove(board, 3, 3, 'black')).toBe(false);
        });

        it('rejects moves that flip nothing', () => {
            const board = createInitialBoard(BOARD_SIZE);
            expect(isLegalMove(board, 0, 0, 'black')).toBe(false);
        });
    });

    describe('getFlippedDiscs', () => {
        it('flips a single opponent disc in one direction', () => {
            const board = createInitialBoard(BOARD_SIZE);
            const flipped = getFlippedDiscs(board, 2, 3, 'black');
            expect(flipped).toEqual([{ row: 3, col: 3 }]);
        });

        it('returns empty for illegal move', () => {
            const board = createInitialBoard(BOARD_SIZE);
            expect(getFlippedDiscs(board, 0, 0, 'black')).toEqual([]);
        });
    });

    describe('applyMove', () => {
        it('places disc and flips opponents', () => {
            const board = createInitialBoard(BOARD_SIZE);
            const { board: next, flipped } = applyMove(board, 2, 3, 'black');
            expect(flipped).toHaveLength(1);
            expect(next[2][3]).toBe('black');
            expect(next[3][3]).toBe('black');
        });

        it('does not mutate the input board', () => {
            const board = createInitialBoard(BOARD_SIZE);
            const snapshot = JSON.stringify(board);
            applyMove(board, 2, 3, 'black');
            expect(JSON.stringify(board)).toBe(snapshot);
        });

        it('returns unchanged board on illegal move', () => {
            const board = createInitialBoard(BOARD_SIZE);
            const { board: next, flipped } = applyMove(board, 0, 0, 'black');
            expect(flipped).toEqual([]);
            expect(next).toBe(board);
        });
    });

    describe('countScore', () => {
        it('handles a full-board endgame', () => {
            const size = 4;
            const board: Disc[][] = Array.from({ length: size }, () =>
                Array<Disc>(size).fill('black')
            );
            board[0][0] = 'white';
            board[0][1] = 'white';
            expect(countScore(board)).toEqual({ black: 14, white: 2 });
        });
    });

    describe('multi-directional flip', () => {
        it('flips two directions at once when applicable', () => {
            const size = 8;
            const board: Disc[][] = Array.from({ length: size }, () =>
                Array<Disc>(size).fill(null)
            );
            // 布置以便在 (3,3) 落黑同时向右与向下夹白
            board[3][4] = 'white';
            board[3][5] = 'black';
            board[4][3] = 'white';
            board[5][3] = 'black';

            const flipped = getFlippedDiscs(board, 3, 3, 'black');
            const key = new Set(flipped.map((f) => `${f.row},${f.col}`));
            expect(key).toEqual(new Set(['3,4', '4,3']));
        });
    });

    describe('chooseAiMove', () => {
        const players: Player[] = ['black', 'white'];

        it.each(players)('returns a legal move on opening for %s (medium)', (p) => {
            const board = createInitialBoard(BOARD_SIZE);
            const move = chooseAiMove(board, p, 'medium');
            expect(move).not.toBeNull();
            expect(isLegalMove(board, move!.row, move!.col, p)).toBe(true);
        });

        it('returns null when no legal move exists', () => {
            const size = 4;
            const board: Disc[][] = Array.from({ length: size }, () =>
                Array<Disc>(size).fill('black')
            );
            expect(chooseAiMove(board, 'white', 'hard')).toBeNull();
        });

        it('easy AI returns a legal move deterministically', () => {
            const board = createInitialBoard(BOARD_SIZE);
            const a = chooseAiMove(board, 'black', 'easy');
            const b = chooseAiMove(board, 'black', 'easy');
            expect(a).toEqual(b);
            expect(isLegalMove(board, a!.row, a!.col, 'black')).toBe(true);
        });
    });
});
