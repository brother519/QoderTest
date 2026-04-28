/**
 * 连连看配置测试
 *
 * 测试关卡配置、图标集和游戏参数
 *
 * @module link-match/constants/__tests__/config
 */

import {
  CARD_ICONS,
  EXTENDED_ICONS,
  ALL_ICONS,
  LEVELS,
  DEFAULT_LEVEL,
  DEFAULT_CONFIG,
  ANIMATION_DURATION,
  SCORE_CONFIG,
  GAME_CONFIG,
} from '../config';
import { GameLevel } from '../../types/game';

describe('连连看配置', () => {
  describe('图标集', () => {
    it('基础图标集应该有 24 个图标', () => {
      expect(CARD_ICONS).toHaveLength(24);
    });

    it('扩展图标集应该有 36 个图标', () => {
      expect(EXTENDED_ICONS).toHaveLength(36);
    });

    it('所有图标集应该有 60 个图标', () => {
      expect(ALL_ICONS).toHaveLength(60);
    });

    it('所有图标集中的图标应该唯一', () => {
      const uniqueIcons = new Set(ALL_ICONS);
      expect(uniqueIcons.size).toBe(ALL_ICONS.length);
    });

    it('基础图标集应该是所有图标集的前缀', () => {
      expect(ALL_ICONS.slice(0, CARD_ICONS.length)).toEqual(CARD_ICONS);
    });
  });

  describe('关卡配置', () => {
    it('应该有三个难度等级', () => {
      expect(Object.keys(LEVELS)).toHaveLength(3);
      expect(LEVELS).toHaveProperty('easy');
      expect(LEVELS).toHaveProperty('medium');
      expect(LEVELS).toHaveProperty('hard');
    });

    it('简单关卡应该是 4x4 棋盘', () => {
      expect(LEVELS.easy.config.rows).toBe(4);
      expect(LEVELS.easy.config.cols).toBe(4);
      expect(LEVELS.easy.config.icons).toHaveLength(8);
    });

    it('中等关卡应该是 6x6 棋盘', () => {
      expect(LEVELS.medium.config.rows).toBe(6);
      expect(LEVELS.medium.config.cols).toBe(6);
      expect(LEVELS.medium.config.icons).toHaveLength(24);
    });

    it('困难关卡应该是 8x8 棋盘', () => {
      expect(LEVELS.hard.config.rows).toBe(8);
      expect(LEVELS.hard.config.cols).toBe(8);
      expect(LEVELS.hard.config.icons).toHaveLength(60);
    });

    it('每个关卡应该有正确的属性', () => {
      const levels: GameLevel[] = ['easy', 'medium', 'hard'];
      
      levels.forEach((level) => {
        expect(LEVELS[level]).toHaveProperty('id', level);
        expect(LEVELS[level]).toHaveProperty('name');
        expect(LEVELS[level]).toHaveProperty('description');
        expect(LEVELS[level]).toHaveProperty('icon');
        expect(LEVELS[level]).toHaveProperty('config');
        expect(LEVELS[level].config).toHaveProperty('rows');
        expect(LEVELS[level].config).toHaveProperty('cols');
        expect(LEVELS[level].config).toHaveProperty('icons');
      });
    });

    it('每个关卡的图标数量应该足够填充棋盘', () => {
      Object.values(LEVELS).forEach((level) => {
        const { rows, cols, icons } = level.config;
        const totalCards = rows * cols;
        const minIconsNeeded = totalCards / 2;
        expect(icons.length).toBeGreaterThanOrEqual(minIconsNeeded);
      });
    });

    it('默认关卡应该是中等', () => {
      expect(DEFAULT_LEVEL).toBe('medium');
    });

    it('默认配置应该与中等关卡一致', () => {
      expect(DEFAULT_CONFIG.rows).toBe(LEVELS.medium.config.rows);
      expect(DEFAULT_CONFIG.cols).toBe(LEVELS.medium.config.cols);
      expect(DEFAULT_CONFIG.icons).toEqual(LEVELS.medium.config.icons);
    });
  });

  describe('动画配置', () => {
    it('应该有正确的动画时长', () => {
      expect(ANIMATION_DURATION.connectionLine).toBe(500);
      expect(ANIMATION_DURATION.cardDisappear).toBe(300);
      expect(ANIMATION_DURATION.cardSelect).toBe(150);
    });

    it('动画时长应该为正数', () => {
      Object.values(ANIMATION_DURATION).forEach((duration) => {
        expect(duration).toBeGreaterThan(0);
      });
    });
  });

  describe('分数配置', () => {
    it('应该有正确的分数设置', () => {
      expect(SCORE_CONFIG.baseScore).toBe(10);
      expect(SCORE_CONFIG.comboMultiplier).toBe(5);
      expect(SCORE_CONFIG.hintPenalty).toBe(20);
    });

    it('分数配置应该为正数', () => {
      expect(SCORE_CONFIG.baseScore).toBeGreaterThan(0);
      expect(SCORE_CONFIG.comboMultiplier).toBeGreaterThan(0);
    });

    it('提示惩罚应该为正数', () => {
      expect(SCORE_CONFIG.hintPenalty).toBeGreaterThan(0);
    });
  });

  describe('游戏全局配置', () => {
    it('应该有正确的游戏参数', () => {
      expect(GAME_CONFIG.maxHints).toBe(3);
      expect(GAME_CONFIG.comboTimeout).toBe(3000);
      expect(GAME_CONFIG.cardSize).toBe(56);
      expect(GAME_CONFIG.cardGap).toBe(4);
    });

    it('游戏参数应该为正数', () => {
      expect(GAME_CONFIG.maxHints).toBeGreaterThan(0);
      expect(GAME_CONFIG.comboTimeout).toBeGreaterThan(0);
      expect(GAME_CONFIG.cardSize).toBeGreaterThan(0);
      expect(GAME_CONFIG.cardGap).toBeGreaterThanOrEqual(0);
    });
  });
});
