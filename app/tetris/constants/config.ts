/**
 * 俄罗斯方块游戏配置常量
 * Tetris Game Configuration Constants
 *
 * 定义游戏中所有常量配置，包括方块定义（7 种方块的 4 个旋转状态矩阵和颜色）、
 * 计分规则、速度等级、颜色方案等。
 *
 * Defines all game constants including piece definitions (4 rotation state matrices
 * and colors for 7 piece types), scoring rules, speed levels, color schemes, etc.
 *
 * @module tetris/constants/config
 */

import { GameConfig, TetrominoDef, TetrominoType } from '../types/game';

/** 默认游戏配置 / Default game configuration */
export const DEFAULT_CONFIG: GameConfig = {
  cols: 10,
  rows: 20,
  cellSize: 28,
  previewCellSize: 22,
};

/**
 * 7 种方块定义
 * 7 Tetromino Definitions
 *
 * 每种方块包含 4 个旋转状态的矩阵和对应颜色。
 * 矩阵中 1 表示实心格，0 表示空格。
 * 旋转顺序：0° → 90° → 180° → 270°（顺时针）
 *
 * Each piece contains 4 rotation state matrices and its color.
 * In the matrix, 1 means solid cell, 0 means empty.
 * Rotation order: 0° → 90° → 180° → 270° (clockwise)
 */
export const TETROMINOES: Record<TetrominoType, TetrominoDef> = {
  /** I 方块：4×4 矩阵，青色 / I piece: 4×4 matrix, cyan */
  I: {
    shapes: [
      [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
      [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
      [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
    ],
    color: '#00f0f0',
  },
  /** O 方块：2×2 矩阵，黄色 / O piece: 2×2 matrix, yellow */
  O: {
    shapes: [
      [[1, 1], [1, 1]],
      [[1, 1], [1, 1]],
      [[1, 1], [1, 1]],
      [[1, 1], [1, 1]],
    ],
    color: '#f0f000',
  },
  /** T 方块：3×3 矩阵，紫色 / T piece: 3×3 matrix, purple */
  T: {
    shapes: [
      [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
      [[0, 1, 0], [1, 1, 0], [0, 1, 0]],
    ],
    color: '#a000f0',
  },
  /** S 方块：3×3 矩阵，绿色 / S piece: 3×3 matrix, green */
  S: {
    shapes: [
      [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
      [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
      [[1, 0, 0], [1, 1, 0], [0, 1, 0]],
    ],
    color: '#00f000',
  },
  /** Z 方块：3×3 矩阵，红色 / Z piece: 3×3 matrix, red */
  Z: {
    shapes: [
      [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
      [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
      [[0, 1, 0], [1, 1, 0], [1, 0, 0]],
    ],
    color: '#f00000',
  },
  /** J 方块：3×3 矩阵，蓝色 / J piece: 3×3 matrix, blue */
  J: {
    shapes: [
      [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
      [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
    ],
    color: '#0000f0',
  },
  /** L 方块：3×3 矩阵，橙色 / L piece: 3×3 matrix, orange */
  L: {
    shapes: [
      [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
      [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
      [[1, 1, 0], [0, 1, 0], [0, 1, 0]],
    ],
    color: '#f0a000',
  },
};

/**
 * 计分规则
 * Scoring Rules
 *
 * 根据同时消除的行数给予不同分数（乘以当前等级）：
 * - 1 行：100 分
 * - 2 行：300 分
 * - 3 行：500 分
 * - 4 行（Tetris）：800 分
 *
 * Points awarded based on lines cleared simultaneously (multiplied by current level):
 * - 1 line: 100 points
 * - 2 lines: 300 points
 * - 3 lines: 500 points
 * - 4 lines (Tetris): 800 points
 *
 * 实际得分 = LINE_SCORES[消除行数] × 当前等级
 * Actual score = LINE_SCORES[lines cleared] × current level
 */
export const LINE_SCORES: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

/** 软降每格加分 / Soft drop score per cell */
export const SOFT_DROP_SCORE = 1;

/** 硬降每格加分 / Hard drop score per cell */
export const HARD_DROP_SCORE = 2;

/**
 * 速度等级配置
 * Speed Level Configuration
 *
 * 每个等级对应的自动下落间隔（毫秒）。
 * 等级越高，下落越快。每消除 10 行提升一级。
 *
 * Auto-drop interval (ms) for each level.
 * Higher level = faster drop. Level up every 10 lines cleared.
 */
export const LEVEL_SPEEDS: number[] = [
  800,  // Level 1
  720,  // Level 2
  630,  // Level 3
  550,  // Level 4
  470,  // Level 5
  380,  // Level 6
  300,  // Level 7
  220,  // Level 8
  150,  // Level 9
  100,  // Level 10
  80,   // Level 11
  60,   // Level 12+
];

/** 每级所需消除行数 / Lines required per level */
export const LINES_PER_LEVEL = 10;

/** 方块颜色映射（便于从类型快速查颜色） / Piece color map (quick color lookup by type) */
export const PIECE_COLORS: Record<TetrominoType, string> = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000',
};

/** 棋盘背景色 / Board background color */
export const BOARD_BG_COLOR = '#16213e';

/** 网格线颜色 / Grid line color */
export const GRID_LINE_COLOR = 'rgba(255, 255, 255, 0.03)';

/** 已锁定方块边框色（增加立体感） / Locked piece border color (adds 3D effect) */
export const CELL_BORDER_COLOR = 'rgba(0, 0, 0, 0.3)';
