import { type MatchResult, SpecialType } from '@/types'
import { SCORE } from '@/constants/game'

export function calculateMatchScore(matches: MatchResult[], combo: number): number {
  let score = 0
  
  for (const match of matches) {
    const baseScore = match.length * SCORE.base
    const lengthBonus = match.length > 3 ? (match.length - 3) * SCORE.base * 2 : 0
    score += baseScore + lengthBonus
  }
  
  const comboMultiplier = 1 + combo * SCORE.comboMultiplier
  score = Math.floor(score * comboMultiplier)
  
  return score
}

export function calculateSpecialScore(specialType: SpecialType): number {
  switch (specialType) {
    case SpecialType.STRIPE_H:
    case SpecialType.STRIPE_V:
      return SCORE.special.stripe
    case SpecialType.BOMB:
      return SCORE.special.bomb
    case SpecialType.RAINBOW:
      return SCORE.special.rainbow
    default:
      return 0
  }
}

export function calculateStars(score: number, thresholds: [number, number, number]): number {
  if (score >= thresholds[2]) return 3
  if (score >= thresholds[1]) return 2
  if (score >= thresholds[0]) return 1
  return 0
}
