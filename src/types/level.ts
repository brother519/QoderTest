import { PieceType } from './piece'

export interface LevelGoal {
  type: 'score' | 'collect' | 'clear'
  target: number
  pieceType?: PieceType
  current: number
}

export interface LevelConfig {
  id: number
  name: string
  moves: number
  goals: LevelGoal[]
  starThresholds: [number, number, number]
  pieceTypes: PieceType[]
  targetScore: number
}
