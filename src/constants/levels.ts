import { PieceType, type LevelConfig } from '@/types'

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: '初学者',
    moves: 20,
    targetScore: 1000,
    goals: [{ type: 'score', target: 1000, current: 0 }],
    starThresholds: [1000, 2000, 3500],
    pieceTypes: [PieceType.RED, PieceType.BLUE, PieceType.GREEN, PieceType.YELLOW]
  },
  {
    id: 2,
    name: '进阶',
    moves: 18,
    targetScore: 2000,
    goals: [{ type: 'score', target: 2000, current: 0 }],
    starThresholds: [2000, 3500, 5000],
    pieceTypes: [PieceType.RED, PieceType.BLUE, PieceType.GREEN, PieceType.YELLOW, PieceType.PURPLE]
  },
  {
    id: 3,
    name: '挑战',
    moves: 15,
    targetScore: 3000,
    goals: [{ type: 'score', target: 3000, current: 0 }],
    starThresholds: [3000, 5000, 7500],
    pieceTypes: [PieceType.RED, PieceType.BLUE, PieceType.GREEN, PieceType.YELLOW, PieceType.PURPLE]
  },
  {
    id: 4,
    name: '专家',
    moves: 15,
    targetScore: 4000,
    goals: [{ type: 'score', target: 4000, current: 0 }],
    starThresholds: [4000, 6500, 9000],
    pieceTypes: [PieceType.RED, PieceType.BLUE, PieceType.GREEN, PieceType.YELLOW, PieceType.PURPLE, PieceType.ORANGE]
  },
  {
    id: 5,
    name: '大师',
    moves: 12,
    targetScore: 5000,
    goals: [{ type: 'score', target: 5000, current: 0 }],
    starThresholds: [5000, 8000, 12000],
    pieceTypes: [PieceType.RED, PieceType.BLUE, PieceType.GREEN, PieceType.YELLOW, PieceType.PURPLE, PieceType.ORANGE]
  }
]
