/**
 * 俄罗斯方块游戏类型定义
 * Tetris Game Type Definitions
 *
 * 定义游戏中所有 TypeScript 类型和接口，包括方块类型、
 * 游戏状态、棋盘结构、活动方块和 Hook 返回值。
 *
 * Defines all TypeScript types and interfaces used in the game, including
 * piece types, game status, board structure, active piece, and Hook return value.
 *
 * @module tetris/types/game
 */

/** 方块类型标识：I/O/T/S/Z/J/L 七种经典方块 / Piece type identifier: 7 classic tetromino types */
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

/** 游戏状态：空闲/进行中/暂停/结束 / Game status: idle/playing/paused/over */
export type GameStatus = 'idle' | 'playing' | 'paused' | 'over';

/** 坐标位置 / Coordinate position */
export interface Position {
  /** 列索引 / Column index */
  x: number;
  /** 行索引 / Row index */
  y: number;
}

/**
 * 方块定义
 * Tetromino Definition
 *
 * 描述一种方块的所有旋转状态和颜色。
 * shape 为二维数组矩阵，1 表示实心格，0 表示空格。
 *
 * Describes all rotation states and color for a piece type.
 * Shape is a 2D array matrix where 1 = solid cell, 0 = empty cell.
 *
 * @property {number[][][]} shapes - 4 个旋转状态的形状矩阵 / 4 rotation state shape matrices
 * @property {string} color - 方块颜色（CSS 颜色值） / Piece color (CSS color value)
 */
export interface TetrominoDef {
  /** 方块形状矩阵（4 个旋转状态） / Piece shape matrices (4 rotation states) */
  shapes: number[][][];
  /** 方块颜色（CSS 颜色值） / Piece color (CSS color value) */
  color: string;
}

/**
 * 当前活动方块
 * Current Active Piece
 *
 * 描述正在下落中的方块的完整状态
 * Describes the complete state of the currently falling piece
 *
 * @property {TetrominoType} type - 方块类型标识 / Piece type identifier
 * @property {number} rotation - 当前旋转状态索引（0~3） / Current rotation state index (0~3)
 * @property {Position} position - 方块左上角在棋盘中的位置 / Piece top-left position on the board
 */
export interface ActivePiece {
  /** 方块类型 / Piece type */
  type: TetrominoType;
  /** 当前旋转状态索引（0~3） / Current rotation state index (0~3) */
  rotation: number;
  /** 方块左上角在棋盘中的位置 / Piece top-left position on the board */
  position: Position;
}

/**
 * 棋盘单元格
 * Board Cell
 *
 * null 表示空格，string 表示已锁定方块的颜色
 * null = empty cell, string = locked piece color
 */
export type CellValue = string | null;

/**
 * 游戏棋盘
 * Game Board
 *
 * 二维数组，board[row][col]
 * row=0 为顶部，row=rows-1 为底部
 *
 * 2D array, board[row][col]
 * row=0 is top, row=rows-1 is bottom
 */
export type Board = CellValue[][];

/**
 * 游戏配置
 * Game Configuration
 *
 * @property {number} cols - 棋盘列数（标准 10） / Board columns (standard 10)
 * @property {number} rows - 棋盘行数（标准 20） / Board rows (standard 20)
 * @property {number} cellSize - 单格像素尺寸 / Cell pixel size
 * @property {number} previewCellSize - 预览区单格像素尺寸 / Preview area cell pixel size
 */
export interface GameConfig {
  /** 棋盘列数（标准 10） / Board columns (standard 10) */
  cols: number;
  /** 棋盘行数（标准 20） / Board rows (standard 20) */
  rows: number;
  /** 单格像素尺寸 / Cell pixel size */
  cellSize: number;
  /** 预览区单格像素尺寸 / Preview area cell pixel size */
  previewCellSize: number;
}

/**
 * Hook 返回的完整游戏接口
 * Complete Game Interface Returned by Hook
 *
 * 包含游戏状态数据和所有操作方法
 * Contains game state data and all action methods
 */
export interface UseTetrisGameReturn {
  /** 棋盘状态 / Board state */
  board: Board;
  /** 当前活动方块（下落中） / Current active piece (falling) */
  currentPiece: ActivePiece | null;
  /** 下一个方块类型 / Next piece type */
  nextPiece: TetrominoType;
  /** 当前得分 / Current score */
  score: number;
  /** 当前等级 / Current level */
  level: number;
  /** 已消除行数 / Lines cleared */
  lines: number;
  /** 游戏状态 / Game status */
  status: GameStatus;
  /** 历史最高分 / All-time high score */
  highScore: number;
  /** 开始游戏 / Start game */
  start: () => void;
  /** 暂停/继续 / Pause/Resume */
  togglePause: () => void;
  /** 重新开始 / Restart */
  restart: () => void;
  /** 左移 / Move left */
  moveLeft: () => void;
  /** 右移 / Move right */
  moveRight: () => void;
  /** 旋转（顺时针） / Rotate (clockwise) */
  rotate: () => void;
  /** 软降（加速下落一格） / Soft drop (accelerate one row) */
  softDrop: () => void;
  /** 硬降（直接落到底部） / Hard drop (drop to bottom) */
  hardDrop: () => void;
}
