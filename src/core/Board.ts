import { type Piece, type Position, PieceType, SpecialType } from '@/types'
import { BOARD_SIZE, PIECE_TYPES } from '@/constants/game'

let pieceIdCounter = 0

export function generatePieceId(): string {
  return `piece_${++pieceIdCounter}_${Date.now()}`
}

export function createPiece(row: number, col: number, type: PieceType): Piece {
  return {
    id: generatePieceId(),
    type,
    special: SpecialType.NONE,
    row,
    col,
    isMatched: false,
    isRemoving: false,
    isNew: true,
    isFalling: false
  }
}

export function getRandomPieceType(availableTypes: PieceType[] = PIECE_TYPES): PieceType {
  return availableTypes[Math.floor(Math.random() * availableTypes.length)]
}

export function generateBoard(availableTypes: PieceType[] = PIECE_TYPES): Piece[][] {
  const board: Piece[][] = []
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = []
    for (let col = 0; col < BOARD_SIZE; col++) {
      let type: PieceType
      let attempts = 0
      
      do {
        type = getRandomPieceType(availableTypes)
        attempts++
      } while (wouldCreateMatch(board, row, col, type) && attempts < 100)
      
      board[row][col] = createPiece(row, col, type)
      board[row][col].isNew = false
    }
  }
  
  return board
}

function wouldCreateMatch(board: Piece[][], row: number, col: number, type: PieceType): boolean {
  if (col >= 2) {
    if (board[row][col - 1]?.type === type && board[row][col - 2]?.type === type) {
      return true
    }
  }
  
  if (row >= 2) {
    if (board[row - 1]?.[col]?.type === type && board[row - 2]?.[col]?.type === type) {
      return true
    }
  }
  
  return false
}

export function isAdjacent(pos1: Position, pos2: Position): boolean {
  const rowDiff = Math.abs(pos1.row - pos2.row)
  const colDiff = Math.abs(pos1.col - pos2.col)
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
}

export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE
}

export function swapPieces(board: Piece[][], pos1: Position, pos2: Position): void {
  const piece1 = board[pos1.row][pos1.col]
  const piece2 = board[pos2.row][pos2.col]
  
  board[pos1.row][pos1.col] = piece2
  board[pos2.row][pos2.col] = piece1
  
  piece1.row = pos2.row
  piece1.col = pos2.col
  piece2.row = pos1.row
  piece2.col = pos1.col
}

export function cloneBoard(board: Piece[][]): Piece[][] {
  return board.map(row => row.map(piece => ({ ...piece })))
}
