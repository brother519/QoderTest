/**
 * formatTime 单元测试
 *
 * 覆盖秒数 → MM:SS 格式的边界与常规用例。
 */

import { formatTime } from '../format';

describe('formatTime', () => {
  it('formats 0 seconds as 00:00', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('zero-pads single-digit seconds and minutes', () => {
    expect(formatTime(5)).toBe('00:05');
    expect(formatTime(9)).toBe('00:09');
    expect(formatTime(60)).toBe('01:00');
  });

  it('formats sub-hour durations as MM:SS', () => {
    expect(formatTime(10)).toBe('00:10');
    expect(formatTime(59)).toBe('00:59');
    expect(formatTime(90)).toBe('01:30');
    expect(formatTime(300)).toBe('05:00');
  });

  it('expresses durations >= 1 hour as total minutes:seconds', () => {
    expect(formatTime(3600)).toBe('60:00');
    expect(formatTime(3661)).toBe('61:01');
    expect(formatTime(86400)).toBe('1440:00');
  });

  it('clamps negative input to 00:00', () => {
    expect(formatTime(-1)).toBe('00:00');
    expect(formatTime(-100)).toBe('00:00');
  });

  it('floors fractional seconds', () => {
    expect(formatTime(61.9)).toBe('01:01');
    expect(formatTime(0.5)).toBe('00:00');
  });
});
