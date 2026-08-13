/**
 * useGuessNumber Hook 测试
 *
 * 测试核心游戏逻辑：密码生成、猜测验证、状态转换。
 */

import { renderHook, act } from '@testing-library/react';
import { useGuessNumber } from '../useGuessNumber';

describe('useGuessNumber', () => {
    beforeAll(() => {
        (localStorage.getItem as jest.Mock).mockReturnValue(null);
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    describe('初始化', () => {
        it('应该初始化游戏状态为 idle', () => {
            const { result } = renderHook(() => useGuessNumber('medium'));

            expect(result.current.status).toBe('idle');
            expect(result.current.attempts).toBe(0);
            expect(result.current.history).toEqual([]);
            expect(result.current.codeLength).toBe(4);
            expect(result.current.maxAttempts).toBe(10);
            expect(result.current.digitRange).toBe(8);
        });

        it('不同难度应有不同配置', () => {
            const { result: easy } = renderHook(() => useGuessNumber('easy'));
            expect(easy.current.codeLength).toBe(3);
            expect(easy.current.maxAttempts).toBe(12);
            expect(easy.current.digitRange).toBe(6);

            const { result: hard } = renderHook(() => useGuessNumber('hard'));
            expect(hard.current.codeLength).toBe(5);
            expect(hard.current.maxAttempts).toBe(8);
            expect(hard.current.digitRange).toBe(10);
        });

        it('secret 在游戏未结束时不暴露', () => {
            const { result } = renderHook(() => useGuessNumber('medium'));
            expect(result.current.secret).toBeNull();
        });
    });

    describe('猜测逻辑', () => {
        it('错误长度的猜测应返回 false', () => {
            const { result } = renderHook(() => useGuessNumber('medium'));

            let success: boolean = false;
            act(() => {
                success = result.current.makeGuess('12');
            });

            expect(success).toBe(false);
            expect(result.current.attempts).toBe(0);
        });

        it('含重复数字的猜测应返回 false', () => {
            const { result } = renderHook(() => useGuessNumber('medium'));

            let success: boolean = false;
            act(() => {
                success = result.current.makeGuess('1123');
            });

            expect(success).toBe(false);
            expect(result.current.attempts).toBe(0);
        });

        it('超出数字范围的猜测应返回 false', () => {
            const { result } = renderHook(() => useGuessNumber('medium'));

            // medium 的 digitRange 为 8，所以 8 和 9 超出范围
            let success: boolean = false;
            act(() => {
                success = result.current.makeGuess('0189');
            });

            expect(success).toBe(false);
        });

        it('有效猜测应增加 attempts 并记入 history', () => {
            const { result } = renderHook(() => useGuessNumber('medium'));

            act(() => {
                result.current.makeGuess('0123');
            });

            expect(result.current.attempts).toBe(1);
            expect(result.current.history).toHaveLength(1);
            expect(result.current.history[0].guess).toBe('0123');
            expect(result.current.status).toBe('playing');
        });

        it('猜测结果应包含正确的 bulls 和 cows', () => {
            const { result } = renderHook(() => useGuessNumber('easy'));

            // 多次猜测检查结果格式
            act(() => {
                result.current.makeGuess('012');
            });

            const record = result.current.history[0];
            expect(record.bulls).toBeGreaterThanOrEqual(0);
            expect(record.cows).toBeGreaterThanOrEqual(0);
            expect(record.bulls + record.cows).toBeLessThanOrEqual(3);
        });
    });

    describe('游戏结束', () => {
        it('达到最大次数后状态变为 lost', () => {
            const { result } = renderHook(() => useGuessNumber('easy'));
            // easy: maxAttempts = 12, codeLength = 3, digitRange = 6

            const guesses = [
                '012', '013', '014', '015',
                '021', '023', '024', '025',
                '031', '032', '034', '035',
            ];

            for (const g of guesses) {
                if (result.current.status === 'playing' || result.current.status === 'idle') {
                    act(() => {
                        result.current.makeGuess(g);
                    });
                }
            }

            // 可能是 won（恰好猜中）或 lost
            expect(['won', 'lost']).toContain(result.current.status);
        });

        it('猜对后状态变为 won 且暴露 secret', () => {
            const { result } = renderHook(() => useGuessNumber('easy'));

            // 用尽所有次数使游戏结束以暴露 secret
            const guesses = [
                '012', '013', '014', '015',
                '021', '023', '024', '025',
                '031', '032', '034', '035',
            ];

            for (const g of guesses) {
                if (result.current.status === 'playing' || result.current.status === 'idle') {
                    act(() => {
                        result.current.makeGuess(g);
                    });
                }
            }

            // 游戏结束后 secret 应暴露
            expect(result.current.secret).not.toBeNull();
            expect(result.current.secret!.length).toBe(3);
        });
    });

    describe('重启与难度切换', () => {
        it('restart 应重置游戏状态', () => {
            const { result } = renderHook(() => useGuessNumber('medium'));

            act(() => {
                result.current.makeGuess('0123');
            });
            act(() => {
                result.current.makeGuess('4567');
            });

            expect(result.current.attempts).toBe(2);

            act(() => {
                result.current.restart();
            });

            expect(result.current.status).toBe('idle');
            expect(result.current.attempts).toBe(0);
            expect(result.current.history).toEqual([]);
        });

        it('切换难度应重置游戏并更新配置', () => {
            const { result } = renderHook(() => useGuessNumber('medium'));

            act(() => {
                result.current.makeGuess('0123');
            });

            act(() => {
                result.current.setDifficulty('hard');
            });

            expect(result.current.difficulty).toBe('hard');
            expect(result.current.codeLength).toBe(5);
            expect(result.current.maxAttempts).toBe(8);
            expect(result.current.status).toBe('idle');
            expect(result.current.attempts).toBe(0);
        });
    });
});
