/**
 * 魔方旋转逻辑单元测试
 *
 * @module rubiks-cube/utils/__tests__/cubeMoves
 */

import {
    applyMove,
    applyMoves,
    createSolvedCube,
    generateScrambleMoves,
    getInverseMove,
    isSolved,
    scrambleCube,
} from '../cubeMoves';
import { FaceKey, Move } from '../../types/game';

const ALL_MOVES: Move[] = [
    'R', 'Ri', 'L', 'Li', 'U', 'Ui', 'D', 'Di', 'F', 'Fi', 'B', 'Bi', 'M', 'Mi', 'E', 'Ei', 'S', 'Si',
];
const FACE_KEYS: FaceKey[] = ['U', 'D', 'F', 'B', 'L', 'R'];

describe('cubeMoves', () => {
    describe('createSolvedCube', () => {
        it('应创建六面颜色一致的还原态', () => {
            const cube = createSolvedCube();
            FACE_KEYS.forEach((face) => {
                expect(cube[face]).toHaveLength(9);
                expect(new Set(cube[face]).size).toBe(1);
            });
        });

        it('isSolved 对还原态返回 true', () => {
            expect(isSolved(createSolvedCube())).toBe(true);
        });
    });

    describe('applyMove', () => {
        it.each(ALL_MOVES)('执行 %s 后魔方不应处于还原态', (move) => {
            const cube = createSolvedCube();
            const next = applyMove(cube, move);
            expect(isSolved(next)).toBe(false);
        });

        it.each(ALL_MOVES)('连续 4 次 %s 后回到原状态', (move) => {
            const cube = createSolvedCube();
            let next = cube;
            for (let i = 0; i < 4; i++) {
                next = applyMove(next, move);
            }
            expect(next).toEqual(cube);
        });

        it.each([
            ['R', 'Ri'],
            ['L', 'Li'],
            ['U', 'Ui'],
            ['D', 'Di'],
            ['F', 'Fi'],
            ['B', 'Bi'],
            ['M', 'Mi'],
            ['E', 'Ei'],
            ['S', 'Si'],
        ] as [Move, Move][])('先 %s 再 %s 回到还原态', (move, inverse) => {
            const cube = createSolvedCube();
            const next = applyMove(applyMove(cube, move), inverse);
            expect(next).toEqual(cube);
        });
    });

    describe('F move sticker correctness', () => {
        it('F rotation (clockwise) moves U color to R face, not L', () => {
            const cube = createSolvedCube();
            const next = applyMove(cube, 'F');

            // L stickers at z=-1 (indices 2,5,8) must remain unchanged.
            expect(next.L[2]).toBe('B');
            expect(next.L[5]).toBe('B');
            expect(next.L[8]).toBe('B');

            // U color (W) must flow to R's left column (physical clockwise).
            expect(next.R[2]).toBe('W');
            expect(next.R[5]).toBe('W');
            expect(next.R[8]).toBe('W');

            // L column at z=1 receives D color (Y).
            expect(next.L[6]).toBe('Y');
            expect(next.L[3]).toBe('Y');
            expect(next.L[0]).toBe('Y');
        });

        it('Fi (F inverse) moves U color to L face', () => {
            const cube = createSolvedCube();
            const next = applyMove(cube, 'Fi');

            // L column at z=-1 stays unchanged.
            expect(next.L[2]).toBe('B');
            expect(next.L[5]).toBe('B');
            expect(next.L[8]).toBe('B');

            // U color (W) flows to L's right column (physical counter-clockwise).
            expect(next.L[0]).toBe('W');
            expect(next.L[3]).toBe('W');
            expect(next.L[6]).toBe('W');
        });
    });

    describe('R move sticker correctness', () => {
        it('R rotation (clockwise) moves U color to B face, matching the animation', () => {
            const cube = createSolvedCube();
            const next = applyMove(cube, 'R');

            // U color (W) must flow to B's right column (physical clockwise).
            expect(next.B[6]).toBe('W');
            expect(next.B[3]).toBe('W');
            expect(next.B[0]).toBe('W');

            // D color (Y) must flow to F's right column.
            expect(next.F[2]).toBe('Y');
            expect(next.F[5]).toBe('Y');
            expect(next.F[8]).toBe('Y');

            // F color (R) must flow to U's right column.
            expect(next.U[2]).toBe('R');
            expect(next.U[5]).toBe('R');
            expect(next.U[8]).toBe('R');
        });
    });

    describe('B move sticker correctness', () => {
        it('B rotation (clockwise) moves U color to L face', () => {
            const cube = createSolvedCube();
            const next = applyMove(cube, 'B');

            // U color (W) flows to L's back column (physical clockwise).
            expect(next.L[8]).toBe('W');
            expect(next.L[5]).toBe('W');
            expect(next.L[2]).toBe('W');

            // R back column receives D color (Y).
            expect(next.R[6]).toBe('Y');
            expect(next.R[3]).toBe('Y');
            expect(next.R[0]).toBe('Y');
        });
    });

    describe('L move sticker correctness', () => {
        it('L rotation moves U left column to F, F left column to D, B right column to U', () => {
            const cube = createSolvedCube();
            const next = applyMove(cube, 'L');

            // U color (W) flows to F's left column.
            expect(next.F[0]).toBe('W');
            expect(next.F[3]).toBe('W');
            expect(next.F[6]).toBe('W');

            // F color (R) flows to D's left column.
            expect(next.D[0]).toBe('R');
            expect(next.D[3]).toBe('R');
            expect(next.D[6]).toBe('R');

            // B color (O) flows to U's left column (reversed indices).
            expect(next.U[0]).toBe('O');
            expect(next.U[3]).toBe('O');
            expect(next.U[6]).toBe('O');
        });
    });

    describe('U move sticker correctness', () => {
        it('U rotation moves R to F, B to R, L to B, F to L', () => {
            const cube = createSolvedCube();
            const next = applyMove(cube, 'U');

            // F color (R=red) flows to L's top row.
            expect(next.L[2]).toBe('R');
            expect(next.L[1]).toBe('R');
            expect(next.L[0]).toBe('R');

            // R color (G=green) flows to F's top row.
            expect(next.F[0]).toBe('G');
            expect(next.F[1]).toBe('G');
            expect(next.F[2]).toBe('G');

            // B color (O=orange) flows to R's top row.
            expect(next.R[2]).toBe('O');
            expect(next.R[1]).toBe('O');
            expect(next.R[0]).toBe('O');
        });
    });

    describe('D move sticker correctness', () => {
        it('D rotation moves F bottom to R, R to B, B to L, L to F', () => {
            const cube = createSolvedCube();
            const next = applyMove(cube, 'D');

            // F color (R=red) flows to R's bottom row (reversed).
            expect(next.R[8]).toBe('R');
            expect(next.R[7]).toBe('R');
            expect(next.R[6]).toBe('R');

            // R color (G=green) flows to B's bottom row (reversed).
            expect(next.B[8]).toBe('G');
            expect(next.B[7]).toBe('G');
            expect(next.B[6]).toBe('G');

            // L color (B=blue) flows to F's bottom row (reversed).
            expect(next.F[6]).toBe('B');
            expect(next.F[7]).toBe('B');
            expect(next.F[8]).toBe('B');
        });
    });

    describe('F move sticker correctness', () => {
        it('F rotation moves U bottom to R left col, L right col to U bottom', () => {
            const cube = createSolvedCube();
            const next = applyMove(cube, 'F');

            // U color (W) flows to R's left column.
            expect(next.R[2]).toBe('W');
            expect(next.R[5]).toBe('W');
            expect(next.R[8]).toBe('W');

            // L color (B=blue) flows to U's bottom row.
            expect(next.U[6]).toBe('B');
            expect(next.U[7]).toBe('B');
            expect(next.U[8]).toBe('B');
        });
    });

    describe('slice moves sticker correctness', () => {
        it('M rotation (clockwise) moves U color to F face', () => {
            const cube = createSolvedCube();
            const next = applyMove(cube, 'M');

            expect(next.F[1]).toBe('W');
            expect(next.F[4]).toBe('W');
            expect(next.F[7]).toBe('W');
        });

        it('E rotation (clockwise) moves F color to R face', () => {
            const cube = createSolvedCube();
            const next = applyMove(cube, 'E');

            expect(next.R[3]).toBe('R');
            expect(next.R[4]).toBe('R');
            expect(next.R[5]).toBe('R');
        });

        it('S rotation (clockwise) moves U color to R face', () => {
            const cube = createSolvedCube();
            const next = applyMove(cube, 'S');

            expect(next.R[1]).toBe('W');
            expect(next.R[4]).toBe('W');
            expect(next.R[7]).toBe('W');
        });
    });

    describe('getInverseMove', () => {
        it.each(ALL_MOVES)('getInverseMove(%s) 与 %s 互为逆操作', (move) => {
            const inverse = getInverseMove(move);
            expect(getInverseMove(inverse)).toBe(move);
        });
    });

    describe('scrambleCube', () => {
        it('打乱后不应处于还原态', () => {
            const { state } = scrambleCube(createSolvedCube(), 20);
            expect(isSolved(state)).toBe(false);
        });

        it('按打乱序列的逆序操作可还原魔方', () => {
            const { state, moves } = scrambleCube(createSolvedCube(), 20);
            const inverseMoves = moves
                .map((move) => getInverseMove(move))
                .reverse();
            const restored = applyMoves(state, inverseMoves);
            expect(isSolved(restored)).toBe(true);
        });
    });

    describe('generateScrambleMoves', () => {
        it('不应连续两步操作同一面', () => {
            const moves = generateScrambleMoves(30);
            for (let i = 1; i < moves.length; i++) {
                expect(moves[i].charAt(0)).not.toBe(moves[i - 1].charAt(0));
            }
        });
    });
});
