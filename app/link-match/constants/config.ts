/**
 * 连连看游戏配置文件
 *
 * 包含卡牌图标、棋盘布局、动画参数、分数规则等全局配置常量。
 * 所有游戏相关的可调参数集中在此文件管理，便于统一维护和调整。
 *
 * @module link-match/constants/config
 */
import { GameConfig, LevelConfig, GameLevel } from '../types/game';

/**
 * emoji 图标集
 *
 * 用于棋盘上卡牌的显示图标，至少需要 18 种不同图标以满足 6x6 棋盘的配对需求。
 * 图标按类别分为四组，每组 6 个：
 * - 第 1 组（水果类）：🍎🍊🍋🍇🍓🍒
 * - 第 2 组（花草类）：🌸🌺🌻🌹🍀🌙
 * - 第 3 组（符号类）：⭐🔥💎🎵🎈🦋
 * - 第 4 组（动物类）：🐱🐶🐼🐨🦊🐰
 *
 * @remarks 若需扩展棋盘尺寸，应同步增加图标数量以保证配对唯一性
 */
export const CARD_ICONS: string[] = [
  '🍎', '🍊', '🍋', '🍇', '🍓', '🍒',
  '🌸', '🌺', '🌻', '🌹', '🍀', '🌙',
  '⭐', '🔥', '💎', '🎵', '🎈', '🦋',
  '🐱', '🐶', '🐼', '🐨', '🦊', '🐰',
];

/**
 * 默认游戏配置
 *
 * 定义棋盘的行列数及使用的图标集，作为初始化游戏时的默认参数。
 *
 * @property {number} rows - 棋盘行数，默认 6
 * @property {number} cols - 棋盘列数，默认 6
 * @property {string[]} icons - 卡牌图标集合，引用 {@link CARD_ICONS}
 */
export const DEFAULT_CONFIG: GameConfig = {
  rows: 6,
  cols: 6,
  icons: CARD_ICONS,
};

/**
 * 扩展图标集
 *
 * 为更大棋盘和更高难度准备的额外图标
 */
export const EXTENDED_ICONS: string[] = [
  '🍕', '🍔', '🍟', '🌭', '🍿', '🥓',
  '🥚', '🥞', '🥐', '🥨', '🥯', '🥖',
  '🧀', '🥗', '🥙', '🥪', '🌮', '🌯',
  '🥫', '🍖', '🍗', '🥩', '🍠', '🥟',
  '🥠', '🥡', '🍱', '🍘', '🍙', '🍚',
  '🍛', '🍜', '🍝', '🍢', '🍣', '🍤',
];

/**
 * 所有可用图标（合并基础图标和扩展图标）
 */
export const ALL_ICONS: string[] = [...CARD_ICONS, ...EXTENDED_ICONS];

/**
 * 关卡配置
 *
 * 定义三个难度等级的关卡配置
 */
export const LEVELS: Record<GameLevel, LevelConfig> = {
  easy: {
    id: 'easy',
    name: '简单',
    description: '4x4 棋盘，适合新手练习',
    icon: '🌱',
    config: {
      rows: 4,
      cols: 4,
      icons: CARD_ICONS.slice(0, 8), // 使用 8 种图标
    },
  },
  medium: {
    id: 'medium',
    name: '中等',
    description: '6x6 棋盘，经典挑战',
    icon: '🌿',
    config: {
      rows: 6,
      cols: 6,
      icons: CARD_ICONS, // 使用 24 种图标
    },
  },
  hard: {
    id: 'hard',
    name: '困难',
    description: '8x8 棋盘，极限挑战',
    icon: '🔥',
    config: {
      rows: 8,
      cols: 8,
      icons: ALL_ICONS, // 使用所有 60 种图标
    },
  },
};

/** 默认关卡 */
export const DEFAULT_LEVEL: GameLevel = 'medium';

/**
 * 动画时长配置（单位：毫秒）
 *
 * 控制游戏中各类动画效果的持续时间，调整这些值可改变游戏的视觉节奏。
 *
 * @property {number} connectionLine - 两张卡牌匹配成功后，连接线的显示时长
 * @property {number} cardDisappear - 匹配成功后卡牌消失的渐隐动画时长
 * @property {number} cardSelect - 点击选中卡牌时的缩放/高亮反馈动画时长
 */
export const ANIMATION_DURATION = {
  /** 连接线显示时长 */
  connectionLine: 500,
  /** 卡牌消失动画时长 */
  cardDisappear: 300,
  /** 卡牌选中反馈动画时长 */
  cardSelect: 150,
};

/**
 * 分数配置
 *
 * 定义游戏中的计分规则，包括基础得分、连击奖励和提示惩罚。
 *
 * @property {number} baseScore - 每次成功消除一对卡牌获得的基础分数
 * @property {number} comboMultiplier - 连击时每次额外叠加的分数（总分 = baseScore + combo * comboMultiplier）
 * @property {number} hintPenalty - 每次使用提示功能扣除的分数
 */
export const SCORE_CONFIG = {
  /** 基础消除得分 */
  baseScore: 10,
  /** 连击额外加分（按连击次数叠加） */
  comboMultiplier: 5,
  /** 使用提示扣分 */
  hintPenalty: 20,
};

/**
 * 游戏全局配置
 *
 * 包含提示次数限制、连击判定窗口、卡牌渲染尺寸等运行时参数。
 *
 * @property {number} maxHints - 每局游戏最多可使用的提示次数
 * @property {number} comboTimeout - 连击判定的时间窗口，两次消除间隔超过此值则连击重置（单位：毫秒）
 * @property {number} cardSize - 单张卡牌的渲染尺寸，用于计算 SVG 连接路径的坐标（单位：像素）
 * @property {number} cardGap - 卡牌之间的间距，影响棋盘整体布局（单位：像素）
 */
export const GAME_CONFIG = {
  /** 最大提示次数 */
  maxHints: 3,
  /** 连击超时时间（毫秒） */
  comboTimeout: 3000,
  /** 卡牌尺寸（像素），用于计算 SVG 路径 */
  cardSize: 56,
  /** 卡牌间距（像素） */
  cardGap: 4,
};
