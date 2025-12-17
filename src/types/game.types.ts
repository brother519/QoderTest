export type GameMode = 'single' | 'double';

export interface PlayerState {
  lives: number;
  score: number;
  activePowerUps: string[];
}

export interface GameState {
  currentLevel: number;
  gameMode: GameMode;
  player1: PlayerState;
  player2: PlayerState;
  enemiesRemaining: number;
  baseDestroyed: boolean;
  isPaused: boolean;
}
