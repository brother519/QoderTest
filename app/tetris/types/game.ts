/**
 * 俄罗斯方块游戏类型定义
 *
 * 定义游戏中所有 TypeScript 类型和接口，包括方块类型、
 * 游戏状态、棋盘结构、活动方块和 Hook 返回值。
 *
 * @module tetris/types/game
 */

/** 方块类型标识：I/O/T/S/Z/J/L 七种经典方块 */
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

/** 游戏状态：空闲/进行中/暂停/结束 */
export type GameStatus = 'idle' | 'playing' | 'paused' | 'over';

/** 坐标位置 */
export interface Position {
  /** 列索引 */
  x: number;
  /** 行索引 */
  y: number;
}

/**
 * 方块定义
 *
 * 描述一种方块的所有旋转状态和颜色。
 * shape 为二维数组矩阵，1 表示实心格，0 表示空格。
 *
 * @property {number[][][]} shapes - 4 个旋转状态的形状矩阵
 * @property {string} color - 方块颜色（CSS 颜色值）
 */
export interface TetrominoDef {
  /** 方块形状矩阵（4 个旋转状态） */
  shapes: number[][][];
  /** 方块颜色（CSS 颜色值） */
  color: string;
}

/**
 * 当前活动方块
 *
 * 描述正在下落中的方块的完整状态
 *
 * @property {TetrominoType} type - 方块类型标识
 * @property {number} rotation - 当前旋转状态索引（0~3）
 * @property {Position} position - 方块左上角在棋盘中的位置
 */
export interface ActivePiece {
  /** 方块类型 */
  type: TetrominoType;
  /** 当前旋转状态索引（0~3） */
  rotation: number;
  /** 方块左上角在棋盘中的位置 */
  position: Position;
}

/**
 * 棋盘单元格
 *
 * null 表示空格，string 表示已锁定方块的颜色
 */
export type CellValue = string | null;

/**
 * 游戏棋盘
 *
 * 二维数组，board[row][col]
 * row=0 为顶部，row=rows-1 为底部
 */
export type Board = CellValue[][];

/**
 * 游戏配置
 *
 * @property {number} cols - 棋盘列数（标准 10）
 * @property {number} rows - 棋盘行数（标准 20）
 * @property {number} cellSize - 单格像素尺寸
 * @property {number} previewCellSize - 预览区单格像素尺寸
 */
export interface GameConfig {
  /** 棋盘列数（标准 10） */
  cols: number;
  /** 棋盘行数（标准 20） */
  rows: number;
  /** 单格像素尺寸 */
  cellSize: number;
  /** 预览区单格像素尺寸 */
  previewCellSize: number;
}

/**
 * Hook 返回的完整游戏接口
 *
 * 包含游戏状态数据和所有操作方法
 */
export interface UseTetrisGameReturn {
  /** 棋盘状态 */
  board: Board;
  /** 当前活动方块（下落中） */
  currentPiece: ActivePiece | null;
  /** 下一个方块类型 */
  nextPiece: TetrominoType;
  /** 当前得分 */
  score: number;
  /** 当前等级 */
  level: number;
  /** 已消除行数 */
  lines: number;
  /** 游戏状态 */
  status: GameStatus;
  /** 历史最高分 */
  highScore: number;
  /** 开始游戏 */
  start: () => void;
  /** 暂停/继续 */
  togglePause: () => void;
  /** 重新开始 */
  restart: () => void;
  /** 左移 */
  moveLeft: () => void;
  /** 右移 */
  moveRight: () => void;
  /** 旋转（顺时针） */
  rotate: () => void;
  /** 软降（加速下落一格） */
  softDrop: () => void;
  /** 硬降（直接落到底部） */
  hardDrop: () => void;
}
