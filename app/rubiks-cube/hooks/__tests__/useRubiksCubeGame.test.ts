import { renderHook, act } from '@testing-library/react';
import { useRubiksCube } from '../useRubiksCube';
import { isSolved } from '../../utils/cubeMoves';

describe('useRubiksCube scramble animation', () => {
    it('scramble plays moves one by one and ends with a non-solved state', () => {
        const { result } = renderHook(() => useRubiksCube());

        act(() => {
            result.current.scramble();
        });

        // Scramble should start immediately with a pending move and animation flag.
        expect(result.current.isAnimating).toBe(true);
        expect(result.current.pendingMove).not.toBeNull();
        expect(result.current.scrambleMoves.length).toBeGreaterThanOrEqual(20);
        expect(result.current.scrambleMoves.length).toBeLessThanOrEqual(30);
        expect(result.current.moves).toBe(0);

        // Simulate the animation end events until no moves remain.
        let iterations = 0;
        while (result.current.pendingMove && iterations < 50) {
            act(() => {
                result.current.commitMove();
            });
            iterations++;
        }

        expect(iterations).toBeGreaterThan(0);
        expect(result.current.pendingMove).toBeNull();
        expect(result.current.isAnimating).toBe(false);
        expect(result.current.moves).toBe(0);
        expect(isSolved(result.current.cubeState)).toBe(false);
    });

    it('reset interrupts an in-progress scramble', () => {
        const { result } = renderHook(() => useRubiksCube());

        act(() => {
            result.current.scramble();
        });

        expect(result.current.isAnimating).toBe(true);

        act(() => {
            result.current.reset();
        });

        expect(result.current.isAnimating).toBe(false);
        expect(result.current.pendingMove).toBeNull();
        expect(isSolved(result.current.cubeState)).toBe(true);
        expect(result.current.status).toBe('idle');
    });
});
