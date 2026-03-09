import { create } from 'zustand';
import { GamePhase } from '../types/game';

interface UIState {
  phase: GamePhase;
  score: number;
  lives: number;
  currentLevel: number;
  enemiesRemaining: number;
  playerPowerUps: {
    hasShield: boolean;
    speedBoost: boolean;
    firepowerLevel: number;
  };
  updateFromEngine: (data: {
    phase: GamePhase;
    score: number;
    lives: number;
    currentLevel: number;
    enemiesRemaining: number;
    playerPowerUps: {
      hasShield: boolean;
      speedBoost: boolean;
      firepowerLevel: number;
    };
  }) => void;
}

export const useGameStore = create<UIState>((set) => ({
  phase: GamePhase.START_SCREEN,
  score: 0,
  lives: 3,
  currentLevel: 0,
  enemiesRemaining: 0,
  playerPowerUps: {
    hasShield: false,
    speedBoost: false,
    firepowerLevel: 0,
  },
  updateFromEngine: (data) => set(data),
}));
