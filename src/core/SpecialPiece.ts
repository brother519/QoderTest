import { type MatchResult, type Piece, SpecialType, PieceType, type Position } from '@/types'
import { BOARD_SIZE } from '@/constants/game'
import { generatePieceId } from './Board'

export function determineSpecialPiece(match: MatchResult, isIntersection: boolean): SpecialType {
  if (isIntersection) {
    return SpecialType.BOMB
  }
  
  if (match.length >= 5) {
    return SpecialType.RAINBOW
  }
  
  if (match.length === 4) {
    return match.isHorizontal ? SpecialType.STRIPE_V : SpecialType.STRIPE_H
  }
  
  return SpecialType.NONE
}

export function findIntersections(matches: MatchResult[]): Set<string> {
  const positionCount = new Map<string, number>()
  
  for (const match of matches) {
    for (const pos of match.positions) {
      const key = `${pos.row},${pos.col}`
      positionCount.set(key, (positionCount.get(key) || 0) + 1)
    }
  }
  
  const intersections = new Set<string>()
  for (const [key, count] of positionCount) {
    if (count > 1) {
      intersections.add(key)
    }
  }
  
  return intersections
}

export function createSpecialPiece(
  board: Piece[][],
  match: MatchResult,
  intersections: Set<string>
): void {
  const centerIndex = Math.floor(match.positions.length / 2)
  const centerPos = match.positions[centerIndex]
  
  const isIntersection = match.positions.some(
    p => intersections.has(`${p.row},${p.col}`)
  )
  
  const specialType = determineSpecialPiece(match, isIntersection)
  
  if (specialType !== SpecialType.NONE && board[centerPos.row]?.[centerPos.col]) {
    board[centerPos.row][centerPos.col].special = specialType
    board[centerPos.row][centerPos.col].isRemoving = false
    board[centerPos.row][centerPos.col].isMatched = false
  }
}

export function triggerSpecialPiece(
  board: Piece[][],
  piece: Piece
): Position[] {
  const affected: Position[] = []
  
  switch (piece.special) {
    case SpecialType.STRIPE_H:
      for (let col = 0; col < BOARD_SIZE; col++) {
        affected.push({ row: piece.row, col })
      }
      break
      
    case SpecialType.STRIPE_V:
      for (let row = 0; row < BOARD_SIZE; row++) {
        affected.push({ row, col: piece.col })
      }
      break
      
    case SpecialType.BOMB:
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const row = piece.row + dr
          const col = piece.col + dc
          if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
            affected.push({ row, col })
          }
        }
      }
      break
      
    case SpecialType.RAINBOW:
      break
  }
  
  return affected
}

export function triggerRainbow(
  board: Piece[][],
  rainbowPiece: Piece,
  targetType: PieceType
): Position[] {
  const affected: Position[] = []
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col]?.type === targetType) {
        affected.push({ row, col })
      }
    }
  }
  
  affected.push({ row: rainbowPiece.row, col: rainbowPiece.col })
  
  return affected
}
