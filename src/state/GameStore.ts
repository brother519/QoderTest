import { create } from 'zustand';
import type { GameMode } from '../types/game';
import { GamePhase } from '../types/game';

/** UI state synchronized from the game engine, consumed by React components. */
interface UIState {
  phase: GamePhase;
  scores: number[];
  lives: number[];
  currentLevel: number;
  enemiesRemaining: number;
  gameMode: GameMode;
  playersInfo: Array<{ hasShield: boolean; speedBoost: boolean; firepowerLevel: number } | null>;
  updateFromEngine: (data: {
    phase: GamePhase;
    scores: number[];
    lives: number[];
    currentLevel: number;
    enemiesRemaining: number;
    gameMode: GameMode;
    playersInfo: Array<{ hasShield: boolean; speedBoost: boolean; firepowerLevel: number } | null>;
  }) => void;
}

export const useGameStore = create<UIState>((set) => ({
  phase: GamePhase.START_SCREEN,
  scores: [0],
  lives: [3],
  currentLevel: 0,
  enemiesRemaining: 0,
  gameMode: 1,
  playersInfo: [null],
  updateFromEngine: (data) => set(data),
}));
