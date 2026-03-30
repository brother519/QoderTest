/**
 * 连连看游戏核心逻辑模块
 *
 * 纯函数架构，完全与 React 解耦。
 * 包含类型定义、棋盘生成、路径查找算法和胜负检测。
 */

import { loadLinkMatchHighScore } from './link-match-persistence'

// ─── 类型定义 ────────────────────────────────────────────

/** 棋盘单元格 */
export interface Cell {
  emoji: string
  isEmpty: boolean
}

/** 格子坐标（行列） */
export interface CellCoord {
  row: number
  col: number
}

/** 棋盘二维数组 */
export type Board = Cell[][]

/** 连接路径 */
export interface MatchPath {
  /** 折点坐标序列（含起点和终点，2-4 个点） */
  points: CellCoord[]
  /** 转折次数（0、1 或 2） */
  turns: number
}

/** 游戏状态枚举 */
export type LinkMatchStatus = 'idle' | 'playing' | 'win' | 'nomoves'

/** 难度枚举 */
export type Difficulty = 'easy' | 'normal' | 'hard'

/** 游戏配置 */
export interface LinkMatchConfig {
  rows: number
  cols: number
  cellSize: number
  emojiCount: number
}

/** 连接动画状态 */
export interface AnimationState {
  path: MatchPath | null
  matchedCoords: [CellCoord, CellCoord] | null
}

/** 完整游戏状态 */
export interface LinkMatchState {
  board: Board
  selected: CellCoord | null
  status: LinkMatchStatus
  score: number
  highScore: number
  difficulty: Difficulty
  config: LinkMatchConfig
  animation: AnimationState
  remainingPairs: number
}

// ─── 常量 ────────────────────────────────────────────────

/** 难度配置映射 */
export const DIFFICULTY_CONFIG: Record<Difficulty, LinkMatchConfig> = {
  easy: { rows: 6, cols: 6, cellSize: 60, emojiCount: 9 },
  normal: { rows: 8, cols: 8, cellSize: 60, emojiCount: 16 },
  hard: { rows: 8, cols: 10, cellSize: 60, emojiCount: 20 },
} as const

/** Emoji 池：12 水果 + 12 动物 = 24 种 */
const EMOJI_POOL: string[] = [
  '🍎', '🍊', '🍋', '🍇', '🍓', '🍑',
  '🥝', '🍍', '🥭', '🍌', '🍒', '🫐',
  '🐱', '🐶', '🐭', '🐹', '🐰', '🦊',
  '🐻', '🐼', '🐨', '🐮', '🐷', '🐸',
]

// ─── 棋盘生成 ────────────────────────────────────────────

/** Fisher-Yates 洗牌 */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** 生成初始棋盘 */
export function generateBoard(config: LinkMatchConfig): Board {
  const { rows, cols, emojiCount } = config
  const totalCells = rows * cols
  const pairsPerEmoji = totalCells / emojiCount

  const emojis = EMOJI_POOL.slice(0, emojiCount)
  const flat: string[] = []
  for (const emoji of emojis) {
    for (let i = 0; i < pairsPerEmoji; i++) {
      flat.push(emoji)
    }
  }

  const shuffled = shuffleArray(flat)
  const board: Board = []
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = []
    for (let c = 0; c < cols; c++) {
      row.push({ emoji: shuffled[r * cols + c], isEmpty: false })
    }
    board.push(row)
  }
  return board
}

// ─── 路径查找算法 ────────────────────────────────────────

/**
 * 检查同行/同列两点之间（不含端点）是否全部为空
 *
 * 坐标允许 -1 和 rows/cols（棋盘外视为空，支持边界外绕路）
 */
function isLineEmpty(
  board: Board,
  from: CellCoord,
  to: CellCoord,
): boolean {
  const rows = board.length
  const cols = board[0].length

  if (from.row === to.row) {
    // 同行，水平扫描
    const r = from.row
    const minC = Math.min(from.col, to.col)
    const maxC = Math.max(from.col, to.col)
    for (let c = minC + 1; c < maxC; c++) {
      if (r < 0 || r >= rows || c < 0 || c >= cols) continue // 边界外视为空
      if (!board[r][c].isEmpty) return false
    }
    return true
  }

  if (from.col === to.col) {
    // 同列，垂直扫描
    const c = from.col
    const minR = Math.min(from.row, to.row)
    const maxR = Math.max(from.row, to.row)
    for (let r = minR + 1; r < maxR; r++) {
      if (r < 0 || r >= rows || c < 0 || c >= cols) continue // 边界外视为空
      if (!board[r][c].isEmpty) return false
    }
    return true
  }

  return false // 不在同行或同列
}

/** 检查坐标是否在棋盘外或为空格 */
function isCellEmpty(board: Board, coord: CellCoord): boolean {
  const rows = board.length
  const cols = board[0].length
  if (coord.row < 0 || coord.row >= rows || coord.col < 0 || coord.col >= cols) {
    return true // 边界外视为空
  }
  return board[coord.row][coord.col].isEmpty
}

/** 0 转折：直线连接 */
function canConnectDirect(
  board: Board,
  a: CellCoord,
  b: CellCoord,
): MatchPath | null {
  if (a.row !== b.row && a.col !== b.col) return null
  if (!isLineEmpty(board, a, b)) return null
  return { points: [a, b], turns: 0 }
}

/** 1 转折：L 形连接 */
function canConnectOneTurn(
  board: Board,
  a: CellCoord,
  b: CellCoord,
): MatchPath | null {
  // 候选拐角 1：(a.row, b.col)
  const corner1: CellCoord = { row: a.row, col: b.col }
  if (
    isCellEmpty(board, corner1) &&
    isLineEmpty(board, a, corner1) &&
    isLineEmpty(board, corner1, b)
  ) {
    return { points: [a, corner1, b], turns: 1 }
  }

  // 候选拐角 2：(b.row, a.col)
  const corner2: CellCoord = { row: b.row, col: a.col }
  if (
    isCellEmpty(board, corner2) &&
    isLineEmpty(board, a, corner2) &&
    isLineEmpty(board, corner2, b)
  ) {
    return { points: [a, corner2, b], turns: 1 }
  }

  return null
}

/** 2 转折：Z/U 形连接 */
function canConnectTwoTurns(
  board: Board,
  a: CellCoord,
  b: CellCoord,
): MatchPath | null {
  const rows = board.length
  const cols = board[0].length

  // 水平扫描：枚举中间行 r（含边界外 -1 和 rows）
  for (let r = -1; r <= rows; r++) {
    const mid1: CellCoord = { row: r, col: a.col }
    const mid2: CellCoord = { row: r, col: b.col }

    if (
      isCellEmpty(board, mid1) &&
      isCellEmpty(board, mid2) &&
      isLineEmpty(board, a, mid1) &&
      isLineEmpty(board, mid1, mid2) &&
      isLineEmpty(board, mid2, b)
    ) {
      return { points: [a, mid1, mid2, b], turns: 2 }
    }
  }

  // 垂直扫描：枚举中间列 c（含边界外 -1 和 cols）
  for (let c = -1; c <= cols; c++) {
    const mid1: CellCoord = { row: a.row, col: c }
    const mid2: CellCoord = { row: b.row, col: c }

    if (
      isCellEmpty(board, mid1) &&
      isCellEmpty(board, mid2) &&
      isLineEmpty(board, a, mid1) &&
      isLineEmpty(board, mid1, mid2) &&
      isLineEmpty(board, mid2, b)
    ) {
      return { points: [a, mid1, mid2, b], turns: 2 }
    }
  }

  return null
}

/**
 * 路径查找主入口
 *
 * 查找两个格子之间是否存在最多 2 次转折的连接路径。
 * 按优先级依次检测：直线 -> L形 -> Z/U形。
 */
export function findMatchPath(
  board: Board,
  a: CellCoord,
  b: CellCoord,
): MatchPath | null {
  // 同一格子不可匹配
  if (a.row === b.row && a.col === b.col) return null

  return (
    canConnectDirect(board, a, b) ??
    canConnectOneTurn(board, a, b) ??
    canConnectTwoTurns(board, a, b)
  )
}

/** 检测棋盘上是否还存在任何有效匹配 */
export function hasAnyValidMove(board: Board): boolean {
  const rows = board.length
  const cols = board[0].length
  const nonEmpty: CellCoord[] = []

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].isEmpty) {
        nonEmpty.push({ row: r, col: c })
      }
    }
  }

  for (let i = 0; i < nonEmpty.length; i++) {
    for (let j = i + 1; j < nonEmpty.length; j++) {
      const ci = nonEmpty[i]
      const cj = nonEmpty[j]
      if (
        board[ci.row][ci.col].emoji === board[cj.row][cj.col].emoji &&
        findMatchPath(board, ci, cj) !== null
      ) {
        return true
      }
    }
  }
  return false
}

// ─── 状态工厂 ────────────────────────────────────────────

/** 创建初始游戏状态 */
export function createInitialState(difficulty: Difficulty = 'normal'): LinkMatchState {
  const config = DIFFICULTY_CONFIG[difficulty]
  return {
    board: [],
    selected: null,
    status: 'idle',
    score: 0,
    highScore: loadLinkMatchHighScore(),
    difficulty,
    config,
    animation: { path: null, matchedCoords: null },
    remainingPairs: 0,
  }
}
