import { formatTime } from '../format';

describe('formatTime', () => {
    it('应将 90 秒格式化为 01:30', () => {
        expect(formatTime(90)).toBe('01:30');
    });

    it('应将 0 秒格式化为 00:00', () => {
        expect(formatTime(0)).toBe('00:00');
    });

    it('应将负数输入处理为 00:00', () => {
        expect(formatTime(-5)).toBe('00:00');
    });

    it('应将小数输入向下取整后格式化', () => {
        expect(formatTime(90.9)).toBe('01:30');
    });
});
