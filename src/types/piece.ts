export enum PieceType {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  ORANGE = 'orange'
}

export enum SpecialType {
  NONE = 'none',
  STRIPE_H = 'stripe_horizontal',
  STRIPE_V = 'stripe_vertical',
  BOMB = 'bomb',
  RAINBOW = 'rainbow'
}

export interface Piece {
  id: string
  type: PieceType
  special: SpecialType
  row: number
  col: number
  isMatched: boolean
  isRemoving: boolean
  isNew: boolean
  isFalling: boolean
}

export const PIECE_COLORS: Record<PieceType, string> = {
  [PieceType.RED]: '#e74c3c',
  [PieceType.BLUE]: '#3498db',
  [PieceType.GREEN]: '#2ecc71',
  [PieceType.YELLOW]: '#f1c40f',
  [PieceType.PURPLE]: '#9b59b6',
  [PieceType.ORANGE]: '#e67e22'
}
