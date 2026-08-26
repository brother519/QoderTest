/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useLightBotGame } from '../useLightBotGame';

describe('useLightBotGame', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('starts in playing status with empty queue', () => {
        const { result } = renderHook(() => useLightBotGame(0));
        expect(result.current.status).toBe('playing');
        expect(result.current.queue).toEqual([]);
    });

    it('appendCommand adds to queue up to MAX_QUEUE_LENGTH', () => {
        const { result } = renderHook(() => useLightBotGame(0));
        act(() => {
            for (let i = 0; i < 35; i++) result.current.appendCommand('right');
        });
        expect(result.current.queue.length).toBe(30);
    });

    it('removeAt removes a single command', () => {
        const { result } = renderHook(() => useLightBotGame(0));
        act(() => {
            result.current.appendCommand('right');
            result.current.appendCommand('down');
            result.current.appendCommand('left');
        });
        act(() => result.current.removeAt(1));
        expect(result.current.queue).toEqual(['right', 'left']);
    });

    it('undo removes the last command', () => {
        const { result } = renderHook(() => useLightBotGame(0));
        act(() => {
            result.current.appendCommand('right');
            result.current.appendCommand('down');
        });
        act(() => result.current.undo());
        expect(result.current.queue).toEqual(['right']);
    });

    it('clear empties the queue', () => {
        const { result } = renderHook(() => useLightBotGame(0));
        act(() => {
            result.current.appendCommand('right');
            result.current.appendCommand('down');
        });
        act(() => result.current.clear());
        expect(result.current.queue).toEqual([]);
    });

    it('runs winning queue to win status', () => {
        const { result } = renderHook(() => useLightBotGame(0));
        act(() => {
            for (const cmd of result.current.level.solution) {
                result.current.appendCommand(cmd);
            }
        });
        act(() => result.current.run());
        act(() => {
            jest.advanceTimersByTime(500 * 30);
        });
        expect(result.current.status).toBe('win');
    });

    it('resets to initial state', () => {
        const { result } = renderHook(() => useLightBotGame(0));
        act(() => result.current.appendCommand('right'));
        act(() => result.current.reset());
        expect(result.current.queue).toEqual([]);
        expect(result.current.status).toBe('playing');
        expect(result.current.robot).toEqual(result.current.level.start);
    });

    it('changes level resets queue and state', () => {
        const { result } = renderHook(() => useLightBotGame(0));
        act(() => result.current.appendCommand('right'));
        act(() => result.current.setLevelIndex(1));
        expect(result.current.queue).toEqual([]);
        expect(result.current.level.id).toBe(2);
    });
});
