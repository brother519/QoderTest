import { PieceType } from '@/types'

export const BOARD_SIZE = 8
export const CELL_SIZE = 50
export const GAP_SIZE = 4

export const PIECE_TYPES = [
  PieceType.RED,
  PieceType.BLUE,
  PieceType.GREEN,
  PieceType.YELLOW,
  PieceType.PURPLE,
  PieceType.ORANGE
]

export const MIN_MATCH = 3

export const ANIMATION_DURATION = {
  swap: 150,
  match: 200,
  drop: 300
}

export const SCORE = {
  base: 10,
  comboMultiplier: 0.5,
  special: {
    stripe: 50,
    bomb: 100,
    rainbow: 200
  }
}
