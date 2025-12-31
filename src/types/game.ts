import type { Piece } from './piece'

export interface Position {
  row: number
  col: number
}

export interface SwapAction {
  from: Position
  to: Position
}

export interface MatchResult {
  positions: Position[]
  length: number
  isHorizontal: boolean
}

export enum GameMode {
  CLASSIC = 'classic',
  TIMED = 'timed',
  ENDLESS = 'endless'
}

export enum GameState {
  IDLE = 'idle',
  PLAYING = 'playing',
  PAUSED = 'paused',
  ANIMATING = 'animating',
  GAME_OVER = 'game_over',
  LEVEL_COMPLETE = 'level_complete'
}

export interface GameData {
  board: Piece[][]
  score: number
  moves: number
  combo: number
  state: GameState
  mode: GameMode
  level: number
  timeLeft: number
}
