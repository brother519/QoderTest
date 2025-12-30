import { type Piece, type Position, PieceType } from '@/types'
import { BOARD_SIZE } from '@/constants/game'
import { createPiece, getRandomPieceType } from './Board'

export interface FallAnimation {
  piece: Piece
  fromRow: number
  toRow: number
}

export function applyGravity(board: Piece[][], availableTypes: PieceType[]): FallAnimation[] {
  const animations: FallAnimation[] = []
  
  for (let col = 0; col < BOARD_SIZE; col++) {
    let writeRow = BOARD_SIZE - 1
    
    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      const piece = board[row][col]
      if (piece && !piece.isRemoving) {
        if (row !== writeRow) {
          animations.push({
            piece,
            fromRow: row,
            toRow: writeRow
          })
          piece.row = writeRow
          piece.isFalling = true
          board[writeRow][col] = piece
          board[row][col] = null as unknown as Piece
        }
        writeRow--
      }
    }
    
    for (let row = writeRow; row >= 0; row--) {
      const newPiece = createPiece(row, col, getRandomPieceType(availableTypes))
      newPiece.isNew = true
      newPiece.isFalling = true
      board[row][col] = newPiece
      animations.push({
        piece: newPiece,
        fromRow: row - (writeRow + 1),
        toRow: row
      })
    }
  }
  
  return animations
}

export function removeMatchedPieces(board: Piece[][], positions: Position[]): void {
  for (const pos of positions) {
    if (board[pos.row]?.[pos.col]) {
      board[pos.row][pos.col].isRemoving = true
    }
  }
}

export function clearRemovedPieces(board: Piece[][]): void {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col]?.isRemoving) {
        board[row][col] = null as unknown as Piece
      }
    }
  }
}
