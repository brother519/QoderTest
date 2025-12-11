import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { GameState, GameAction } from '../types';
import { gameReducer, initialState } from './gameReducer';

interface GameContextType {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}