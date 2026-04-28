/**
 * useGameLogic Hook 测试
 *
 * 测试游戏核心逻辑，包括棋盘初始化、卡牌选择、匹配判定、
 * 死局检测和自动重排功能。
 *
 * @module link-match/hooks/__tests__/useGameLogic
 */

import { renderHook, act } from '@testing-library/react';
import { useGameLogic } from '../useGameLogic';
import { GameConfig } from '../types/game';

// Mock 游戏配置
const mockConfig: GameConfig = {
  rows: 4,
  cols: 4,
  icons: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🌸', '🌺'],
};

// 不同的配置用于测试配置变化
const mockConfig2: GameConfig = {
  rows: 6,
  cols: 6,
  icons: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🌸', '🌺', '🌻', '🌹', '🍀', '🌙', '⭐', '🔥', '💎', '🎵', '🎈', '🦋'],
};

describe('useGameLogic', () => {
  const onMatch = jest.fn();
  const onMismatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('初始化', () => {
    it('应该初始化空棋盘', () => {
      const { result } = renderHook(() =>
        useGameLogic(mockConfig, onMatch, onMismatch)
      );

      // 初始棋盘应该是空棋盘（只有外围边界）
      expect(result.current.board).toBeDefined();
      expect(result.current.board.length).toBe(mockConfig.rows + 2);
    });

    it('应该初始化选中卡牌为空数组', () => {
      const { result } = renderHook(() =>
        useGameLogic(mockConfig, onMatch, onMismatch)
      );

      expect(result.current.selectedCards).toEqual([]);
    });

    it('应该初始化连接路径为 null', () => {
      const { result } = renderHook(() =>
        useGameLogic(mockConfig, onMatch, onMismatch)
      );

      expect(result.current.connectionPath).toBeNull();
    });
  });

  describe('配置变化', () => {
    it('应该在配置变化时重新初始化棋盘', () => {
      const { result, rerender } = renderHook(
        ({ config }) => useGameLogic(config, onMatch, onMismatch),
        { initialProps: { config: mockConfig } }
      );

      const initialBoard = result.current.board;

      // 改变配置并重新渲染
      rerender({ config: mockConfig2 });

      // 棋盘应该更新（尺寸变化）
      expect(result.current.board.length).toBe(mockConfig2.rows + 2);
    });
  });

  describe('游戏控制', () => {
    it('应该提供重置游戏方法', () => {
      const { result } = renderHook(() =>
        useGameLogic(mockConfig, onMatch, onMismatch)
      );

      expect(result.current.resetGame).toBeDefined();
      expect(typeof result.current.resetGame).toBe('function');
    });

    it('应该提供获取提示方法', () => {
      const { result } = renderHook(() =>
        useGameLogic(mockConfig, onMatch, onMismatch)
      );

      expect(result.current.getHint).toBeDefined();
      expect(typeof result.current.getHint).toBe('function');
    });

    it('应该提供检查可移动方法', () => {
      const { result } = renderHook(() =>
        useGameLogic(mockConfig, onMatch, onMismatch)
      );

      expect(result.current.hasAvailableMoves).toBeDefined();
      expect(typeof result.current.hasAvailableMoves).toBe('function');
    });

    it('应该提供重排方法', () => {
      const { result } = renderHook(() =>
        useGameLogic(mockConfig, onMatch, onMismatch)
      );

      expect(result.current.reshuffle).toBeDefined();
      expect(typeof result.current.reshuffle).toBe('function');
    });
  });

  describe('死局检测', () => {
    it('应该提供 hasAvailableMoves 方法', () => {
      const { result } = renderHook(() =>
        useGameLogic(mockConfig, onMatch, onMismatch)
      );

      // 验证方法存在且可调用
      expect(result.current.hasAvailableMoves).toBeDefined();
      expect(typeof result.current.hasAvailableMoves).toBe('function');
      expect(() => result.current.hasAvailableMoves()).not.toThrow();
    });
  });

  describe('卡牌选择', () => {
    it('应该提供处理卡牌选择方法', () => {
      const { result } = renderHook(() =>
        useGameLogic(mockConfig, onMatch, onMismatch)
      );

      expect(result.current.handleCardSelect).toBeDefined();
      expect(typeof result.current.handleCardSelect).toBe('function');
    });
  });
});
