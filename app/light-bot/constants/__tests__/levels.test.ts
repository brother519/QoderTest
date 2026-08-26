import { LEVELS } from '../levels';
import { createInitialState, executeStep, isWin } from '../../engine/engine';

describe('LEVELS solvability', () => {
    for (const level of LEVELS) {
        it(`Level ${level.id} "${level.name}" has a valid solution`, () => {
            let state = createInitialState(level);
            for (const cmd of level.solution) {
                const next = executeStep(state, cmd, level);
                expect(next).not.toBeNull();
                if (!next) return;
                state = next;
            }
            expect(isWin(state, level)).toBe(true);
        });
    }
});
