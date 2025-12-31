export type CellState = 'hidden' | 'revealed' | 'flagged';

export interface Cell {
  id: string;
  x: number;
  y: number;
  hasMine: boolean;
  state: CellState;
  adjacentMines: number;
  isRevealed: boolean;
  isFlagged: boolean;
}

export interface GameBoard {
  width: number;
  height: number;
  totalMines: number;
  cells: Cell[];
}

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export interface GameState {
  board: GameBoard;
  status: GameStatus;
  elapsedTime: number;
  flaggedCount: number;
  revealedCount: number;
  startTime: number | null;
}

export interface Level {
  id: string;
  name: string;
  width: number;
  height: number;
  mines: number;
}

export interface GameRecord {
  id: string;
  level: Level;
  status: 'won' | 'lost';
  elapsedTime: number;
  timestamp: number;
  flaggedCount: number;
  revealedCount: number;
}

export interface Statistics {
  totalGames: number;
  wins: number;
  losses: number;
  totalTimeSpent: number;
  easyStats: { total: number; wins: number; avgTime: number };
  mediumStats: { total: number; wins: number; avgTime: number };
  hardStats: { total: number; wins: number; avgTime: number };
}

export interface UserSettings {
  soundEnabled: boolean;
  animationEnabled: boolean;
  theme: 'light' | 'dark';
}
