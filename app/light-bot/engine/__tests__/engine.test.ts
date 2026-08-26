import {
    createInitialState,
    executeStep,
    isWin,
} from '../engine';
import { Level } from '../../types/game';

const tinyLevel: Level = {
    id: 1,
    name: 'tiny',
    size: 3,
    start: { row: 0, col: 0 },
    walls: [{ row: 1, col: 1 }],
    lamps: [
        { row: 0, col: 1 },
        { row: 0, col: 2 },
    ],
    solution: ['right', 'light', 'right', 'light'],
};

describe('engine', () => {
    describe('createInitialState', () => {
        it('puts robot at start and no lamps lit', () => {
            const state = createInitialState(tinyLevel);
            expect(state.robot).toEqual({ row: 0, col: 0 });
            expect(state.litLamps).toEqual([]);
            expect(state.status).toBe('running');
        });
    });

    describe('executeStep: movement', () => {
        // 绕着 (1,1) 的墙走一圈，覆盖四个方向的合法移动
        it('moves up / down / left / right within bounds', () => {
            let s = createInitialState(tinyLevel);
            s = executeStep(s, 'right', tinyLevel)!;
            expect(s.robot).toEqual({ row: 0, col: 1 });
            s = executeStep(s, 'right', tinyLevel)!;
            expect(s.robot).toEqual({ row: 0, col: 2 });
            s = executeStep(s, 'down', tinyLevel)!;
            expect(s.robot).toEqual({ row: 1, col: 2 });
            s = executeStep(s, 'down', tinyLevel)!;
            expect(s.robot).toEqual({ row: 2, col: 2 });
            s = executeStep(s, 'left', tinyLevel)!;
            expect(s.robot).toEqual({ row: 2, col: 1 });
            s = executeStep(s, 'left', tinyLevel)!;
            expect(s.robot).toEqual({ row: 2, col: 0 });
            s = executeStep(s, 'up', tinyLevel)!;
            expect(s.robot).toEqual({ row: 1, col: 0 });
            s = executeStep(s, 'up', tinyLevel)!;
            expect(s.robot).toEqual({ row: 0, col: 0 });
        });

        it('returns null when moving into a wall', () => {
            let s = createInitialState(tinyLevel);
            s = executeStep(s, 'right', tinyLevel)!;
            const next = executeStep(s, 'down', tinyLevel);
            expect(next).toBeNull();
        });

        it('returns null when moving out of bounds', () => {
            const s = createInitialState(tinyLevel);
            const next = executeStep(s, 'up', tinyLevel);
            expect(next).toBeNull();
        });
    });

    describe('executeStep: light', () => {
        it('lights a lamp at the robot cell', () => {
            let s = createInitialState(tinyLevel);
            s = executeStep(s, 'right', tinyLevel)!;
            s = executeStep(s, 'light', tinyLevel)!;
            expect(s.litLamps).toContain('0,1');
        });

        it('is a no-op when robot is on an empty cell', () => {
            const s = createInitialState(tinyLevel);
            const next = executeStep(s, 'light', tinyLevel)!;
            expect(next.litLamps).toEqual([]);
        });

        it('is idempotent on the same lamp', () => {
            let s = createInitialState(tinyLevel);
            s = executeStep(s, 'right', tinyLevel)!;
            s = executeStep(s, 'light', tinyLevel)!;
            s = executeStep(s, 'light', tinyLevel)!;
            expect(s.litLamps.filter((x) => x === '0,1').length).toBe(1);
        });
    });

    describe('isWin', () => {
        it('returns true only when all lamps are lit', () => {
            let s = createInitialState(tinyLevel);
            expect(isWin(s, tinyLevel)).toBe(false);
            s = executeStep(s, 'right', tinyLevel)!;
            s = executeStep(s, 'light', tinyLevel)!;
            expect(isWin(s, tinyLevel)).toBe(false);
            s = executeStep(s, 'right', tinyLevel)!;
            s = executeStep(s, 'light', tinyLevel)!;
            expect(isWin(s, tinyLevel)).toBe(true);
        });
    });
});
