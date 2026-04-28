/**
 * useHighScore Hook 测试
 * 
 * 测试 localStorage 高分管理功能
 */

import { renderHook, act } from '@testing-library/react';
import { useHighScore } from '../useHighScore';

describe('useHighScore', () => {
  const testStorageKey = 'test-high-score';

  beforeEach(() => {
    // 清空 localStorage
    (localStorage.getItem as jest.Mock).mockClear();
    (localStorage.setItem as jest.Mock).mockClear();
    (localStorage.removeItem as jest.Mock).mockClear();
    
    // 模拟 localStorage 返回 null（无历史记录）
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
  });

  it('应该初始化高分为 0', () => {
    const { result } = renderHook(() => useHighScore(testStorageKey));
    
    expect(result.current[0]).toBe(0);
  });

  it('应该从 localStorage 加载已保存的高分', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('100');
    
    const { result } = renderHook(() => useHighScore(testStorageKey));
    
    expect(result.current[0]).toBe(100);
    expect(localStorage.getItem).toHaveBeenCalledWith(testStorageKey);
  });

  it('当新分数超过记录时应该更新高分并保存到 localStorage', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('50');
    
    const { result } = renderHook(() => useHighScore(testStorageKey));
    
    expect(result.current[0]).toBe(50);
    
    act(() => {
      result.current[1](100);
    });
    
    expect(result.current[0]).toBe(100);
    expect(localStorage.setItem).toHaveBeenCalledWith(testStorageKey, '100');
  });

  it('当新分数未超过记录时不应该更新', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('100');
    
    const { result } = renderHook(() => useHighScore(testStorageKey));
    
    expect(result.current[0]).toBe(100);
    
    act(() => {
      result.current[1](50);
    });
    
    expect(result.current[0]).toBe(100);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('当分数等于当前高分时不应该更新', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('100');
    
    const { result } = renderHook(() => useHighScore(testStorageKey));
    
    act(() => {
      result.current[1](100);
    });
    
    expect(result.current[0]).toBe(100);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('应该能处理多次分数更新', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    
    const { result } = renderHook(() => useHighScore(testStorageKey));
    
    act(() => {
      result.current[1](50);
    });
    expect(result.current[0]).toBe(50);
    expect(localStorage.setItem).toHaveBeenCalledWith(testStorageKey, '50');
    
    act(() => {
      result.current[1](30);
    });
    expect(result.current[0]).toBe(50);
    
    act(() => {
      result.current[1](80);
    });
    expect(result.current[0]).toBe(80);
    expect(localStorage.setItem).toHaveBeenCalledWith(testStorageKey, '80');
  });

  it('不同的 storage key 应该有独立的高分', () => {
    (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'game1-high') return '50';
      if (key === 'game2-high') return '100';
      return null;
    });
    
    const { result: result1 } = renderHook(() => useHighScore('game1-high'));
    const { result: result2 } = renderHook(() => useHighScore('game2-high'));
    
    expect(result1.current[0]).toBe(50);
    expect(result2.current[0]).toBe(100);
  });

  it('localStorage 不可用时应该优雅降级', () => {
    (localStorage.getItem as jest.Mock).mockImplementation(() => {
      throw new Error('localStorage unavailable');
    });
    
    const { result } = renderHook(() => useHighScore(testStorageKey));
    
    // 应该不会抛出错误，而是使用默认值 0
    expect(result.current[0]).toBe(0);
  });
});
