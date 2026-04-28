/**
 * 工具函数测试 - formatTime
 * 
 * 测试时间格式化函数是否正确将秒数转换为 MM:SS 格式
 */

import { formatTime } from '../../utils/format';

describe('formatTime', () => {
  it('应该正确格式化 0 秒', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('应该正确格式化少于 10 秒的时间', () => {
    expect(formatTime(5)).toBe('00:05');
    expect(formatTime(9)).toBe('00:09');
  });

  it('应该正确格式化 10-59 秒的时间', () => {
    expect(formatTime(10)).toBe('00:10');
    expect(formatTime(30)).toBe('00:30');
    expect(formatTime(59)).toBe('00:59');
  });

  it('应该正确格式化 1 分钟', () => {
    expect(formatTime(60)).toBe('01:00');
  });

  it('应该正确格式化 1 分 30 秒', () => {
    expect(formatTime(90)).toBe('01:30');
  });

  it('应该正确格式化多分钟', () => {
    expect(formatTime(120)).toBe('02:00');
    expect(formatTime(150)).toBe('02:30');
    expect(formatTime(300)).toBe('05:00');
  });

  it('应该正确格式化超过 1 小时的时间', () => {
    expect(formatTime(3600)).toBe('60:00');
    expect(formatTime(3661)).toBe('61:01');
  });

  it('应该正确处理大数值', () => {
    expect(formatTime(86400)).toBe('1440:00'); // 24 小时
  });

  it('应该处理负数输入', () => {
    expect(formatTime(-5)).toBe('00:00');
    expect(formatTime(-100)).toBe('00:00');
    expect(formatTime(-1)).toBe('00:00');
  });
});
