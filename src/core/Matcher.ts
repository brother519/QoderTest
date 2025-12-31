import { type Piece, type Position, type MatchResult, SpecialType } from '@/types'
import { BOARD_SIZE, MIN_MATCH } from '@/constants/game'

export function findAllMatches(board: Piece[][]): MatchResult[] {
  const matches: MatchResult[] = []
  const visited = new Set<string>()
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col <= BOARD_SIZE - MIN_MATCH; col++) {
      const horizontalMatch = findHorizontalMatch(board, row, col)
      if (horizontalMatch && horizontalMatch.length >= MIN_MATCH) {
        const key = horizontalMatch.positions.map(p => `${p.row},${p.col}`).join('|')
        if (!visited.has(key)) {
          visited.add(key)
          matches.push(horizontalMatch)
        }
      }
    }
  }
  
  for (let col = 0; col < BOARD_SIZE; col++) {
    for (let row = 0; row <= BOARD_SIZE - MIN_MATCH; row++) {
      const verticalMatch = findVerticalMatch(board, row, col)
      if (verticalMatch && verticalMatch.length >= MIN_MATCH) {
        const key = verticalMatch.positions.map(p => `${p.row},${p.col}`).join('|')
        if (!visited.has(key)) {
          visited.add(key)
          matches.push(verticalMatch)
        }
      }
    }
  }
  
  return matches
}

function findHorizontalMatch(board: Piece[][], row: number, startCol: number): MatchResult | null {
  const piece = board[row][startCol]
  if (!piece || piece.special === SpecialType.RAINBOW) return null
  
  const positions: Position[] = [{ row, col: startCol }]
  
  for (let col = startCol + 1; col < BOARD_SIZE; col++) {
    if (board[row][col]?.type === piece.type && board[row][col]?.special !== SpecialType.RAINBOW) {
      positions.push({ row, col })
    } else {
      break
    }
  }
  
  if (positions.length >= MIN_MATCH) {
    return { positions, length: positions.length, isHorizontal: true }
  }
  
  return null
}

function findVerticalMatch(board: Piece[][], startRow: number, col: number): MatchResult | null {
  const piece = board[startRow][col]
  if (!piece || piece.special === SpecialType.RAINBOW) return null
  
  const positions: Position[] = [{ row: startRow, col }]
  
  for (let row = startRow + 1; row < BOARD_SIZE; row++) {
    if (board[row][col]?.type === piece.type && board[row][col]?.special !== SpecialType.RAINBOW) {
      positions.push({ row, col })
    } else {
      break
    }
  }
  
  if (positions.length >= MIN_MATCH) {
    return { positions, length: positions.length, isHorizontal: false }
  }
  
  return null
}

export function getMatchedPositions(matches: MatchResult[]): Position[] {
  const posSet = new Set<string>()
  const positions: Position[] = []
  
  for (const match of matches) {
    for (const pos of match.positions) {
      const key = `${pos.row},${pos.col}`
      if (!posSet.has(key)) {
        posSet.add(key)
        positions.push(pos)
      }
    }
  }
  
  return positions
}

export function wouldSwapCreateMatch(board: Piece[][], pos1: Position, pos2: Position): boolean {
  const tempBoard = board.map(row => row.map(piece => ({ ...piece })))
  
  const piece1 = tempBoard[pos1.row][pos1.col]
  const piece2 = tempBoard[pos2.row][pos2.col]
  tempBoard[pos1.row][pos1.col] = piece2
  tempBoard[pos2.row][pos2.col] = piece1
  
  if (piece1.special === SpecialType.RAINBOW || piece2.special === SpecialType.RAINBOW) {
    return true
  }
  
  const matches = findAllMatches(tempBoard)
  return matches.length > 0
}

export function hasValidMoves(board: Piece[][]): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (col < BOARD_SIZE - 1) {
        if (wouldSwapCreateMatch(board, { row, col }, { row, col: col + 1 })) {
          return true
        }
      }
      if (row < BOARD_SIZE - 1) {
        if (wouldSwapCreateMatch(board, { row, col }, { row: row + 1, col })) {
          return true
        }
      }
    }
  }
  return false
}
