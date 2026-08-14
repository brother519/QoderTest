// Direction for path connections
export type Direction = 'up' | 'right' | 'down' | 'left';

// Cell types on the board
export type CellType = 'empty' | 'endpoint' | 'path';

// Single cell on the board
export interface Cell {
  type: CellType;
  colorId: number | null;
  isEndpoint: boolean;
}

// A position on the grid
export interface Position {
  row: number;
  col: number;
}

// An endpoint pair (two positions of the same color)
export interface EndpointPair {
  colorId: number;
  start: Position;
  end: Position;
}

// A puzzle definition
export interface FlowPuzzle {
  size: number;
  endpoints: EndpointPair[];
}

// Difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard';

// Difficulty configuration
export interface DifficultyConfig {
  size: number;
  numColors: number;
  label: string;
}

// Game status
export type FlowFreeStatus = 'idle' | 'playing' | 'won';

// Hook return type
export interface UseFlowFreeGameReturn {
  board: Cell[][];
  paths: Map<number, Position[]>;
  status: FlowFreeStatus;
  level: number;
  score: number;
  moves: number;
  highScore: number;
  isDrawing: boolean;
  currentColor: number | null;
  completedColors: Set<number>;
  totalColors: number;
  start: () => void;
  restart: () => void;
  nextLevel: () => void;
  startDrawing: (row: number, col: number) => void;
  extendPath: (row: number, col: number) => void;
  endDrawing: () => void;
  clearPath: (colorId: number) => void;
}
