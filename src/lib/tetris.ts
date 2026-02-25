// 游戏常量
export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20
export const CELL_SIZE = 28

// 方块类型
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

// 方块形状定义 (4种旋转状态)
export const TETROMINOES: Record<TetrominoType, number[][][]> = {
  I: [
    [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
    [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
    [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
    [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]],
  ],
  O: [
    [[1,1], [1,1]],
    [[1,1], [1,1]],
    [[1,1], [1,1]],
    [[1,1], [1,1]],
  ],
  T: [
    [[0,1,0], [1,1,1], [0,0,0]],
    [[0,1,0], [0,1,1], [0,1,0]],
    [[0,0,0], [1,1,1], [0,1,0]],
    [[0,1,0], [1,1,0], [0,1,0]],
  ],
  S: [
    [[0,1,1], [1,1,0], [0,0,0]],
    [[0,1,0], [0,1,1], [0,0,1]],
    [[0,0,0], [0,1,1], [1,1,0]],
    [[1,0,0], [1,1,0], [0,1,0]],
  ],
  Z: [
    [[1,1,0], [0,1,1], [0,0,0]],
    [[0,0,1], [0,1,1], [0,1,0]],
    [[0,0,0], [1,1,0], [0,1,1]],
    [[0,1,0], [1,1,0], [1,0,0]],
  ],
  J: [
    [[1,0,0], [1,1,1], [0,0,0]],
    [[0,1,1], [0,1,0], [0,1,0]],
    [[0,0,0], [1,1,1], [0,0,1]],
    [[0,1,0], [0,1,0], [1,1,0]],
  ],
  L: [
    [[0,0,1], [1,1,1], [0,0,0]],
    [[0,1,0], [0,1,0], [0,1,1]],
    [[0,0,0], [1,1,1], [1,0,0]],
    [[1,1,0], [0,1,0], [0,1,0]],
  ],
}

// 方块颜色映射
export const TETROMINO_COLORS: Record<TetrominoType, string> = {
  I: 'cell-i',
  O: 'cell-o',
  T: 'cell-t',
  S: 'cell-s',
  Z: 'cell-z',
  J: 'cell-j',
  L: 'cell-l',
}

// 游戏状态
export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover'

// 当前方块状态
export interface Piece {
  type: TetrominoType
  rotation: number
  x: number
  y: number
}

// 游戏板格子
export type CellType = TetrominoType | null

// 游戏状态
export interface GameState {
  board: CellType[][]
  currentPiece: Piece | null
  nextPiece: TetrominoType
  score: number
  lines: number
  level: number
  status: GameStatus
}

// 创建空游戏板
export function createEmptyBoard(): CellType[][] {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
}

// 随机生成方块类型
export function randomTetromino(): TetrominoType {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
  return types[Math.floor(Math.random() * types.length)]
}

// 创建新方块
export function createPiece(type: TetrominoType): Piece {
  return {
    type,
    rotation: 0,
    x: Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINOES[type][0][0].length / 2),
    y: 0,
  }
}

// 获取方块形状
export function getPieceShape(piece: Piece): number[][] {
  return TETROMINOES[piece.type][piece.rotation]
}

// 检查位置是否有效
export function isValidPosition(board: CellType[][], piece: Piece, offsetX = 0, offsetY = 0): boolean {
  const shape = getPieceShape(piece)
  const newX = piece.x + offsetX
  const newY = piece.y + offsetY

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const boardX = newX + col
        const boardY = newY + row

        // 检查边界
        if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
          return false
        }

        // 检查碰撞 (忽略顶部以外的位置)
        if (boardY >= 0 && board[boardY][boardX] !== null) {
          return false
        }
      }
    }
  }
  return true
}

// 旋转方块
export function rotatePiece(board: CellType[][], piece: Piece): Piece {
  const newRotation = (piece.rotation + 1) % 4
  const newPiece = { ...piece, rotation: newRotation }

  // 尝试直接旋转
  if (isValidPosition(board, newPiece)) {
    return newPiece
  }

  // 墙踢 (Wall Kick) - 尝试左右偏移
  const kicks = [-1, 1, -2, 2]
  for (const kick of kicks) {
    if (isValidPosition(board, newPiece, kick, 0)) {
      return { ...newPiece, x: newPiece.x + kick }
    }
  }

  // 无法旋转，返回原方块
  return piece
}

// 将方块固定到游戏板
export function lockPiece(board: CellType[][], piece: Piece): CellType[][] {
  const newBoard = board.map(row => [...row])
  const shape = getPieceShape(piece)

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const boardY = piece.y + row
        const boardX = piece.x + col
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = piece.type
        }
      }
    }
  }

  return newBoard
}

// 检查并消除完整的行
export function clearLines(board: CellType[][]): { newBoard: CellType[][], linesCleared: number } {
  const newBoard: CellType[][] = []
  let linesCleared = 0

  // 从下往上检查每一行
  for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
    const isComplete = board[row].every(cell => cell !== null)
    if (!isComplete) {
      newBoard.unshift([...board[row]])
    } else {
      linesCleared++
    }
  }

  // 在顶部添加空行
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null))
  }

  return { newBoard, linesCleared }
}

// 计算分数
export function calculateScore(linesCleared: number, level: number): number {
  const baseScores = [0, 100, 300, 500, 800] // 0, 1, 2, 3, 4行的基础分数
  return baseScores[linesCleared] * (level + 1)
}

// 计算等级
export function calculateLevel(totalLines: number): number {
  return Math.floor(totalLines / 10)
}

// 计算下落速度 (毫秒)
export function calculateDropSpeed(level: number): number {
  return Math.max(100, 1000 - level * 100)
}

// 硬降 - 直接落到底部
export function hardDrop(board: CellType[][], piece: Piece): { piece: Piece, dropDistance: number } {
  let dropDistance = 0
  let newPiece = { ...piece }

  while (isValidPosition(board, newPiece, 0, 1)) {
    newPiece.y++
    dropDistance++
  }

  return { piece: newPiece, dropDistance }
}

// 获取投影位置 (Ghost piece)
export function getGhostPosition(board: CellType[][], piece: Piece): number {
  let ghostY = piece.y
  const testPiece = { ...piece }

  while (isValidPosition(board, testPiece, 0, 1)) {
    testPiece.y++
    ghostY++
  }

  return ghostY
}

// 检查游戏是否结束
export function isGameOver(board: CellType[][], piece: Piece): boolean {
  return !isValidPosition(board, piece)
}
