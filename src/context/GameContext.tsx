import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import GameEngine from '../services/gameEngine';
import { GameState, Level, GameStatus, GameRecord } from '../types/game';
import { LEVEL_MAP } from '../constants/levels';
import { storageService } from '../services/storageService';
import { statisticsService } from '../services/statisticsService';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface GameContextType {
  gameState: GameState;
  currentLevel: Level;
  revealCell: (x: number, y: number) => void;
  toggleFlag: (x: number, y: number) => void;
  resetGame: () => void;
  selectLevel: (levelId: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLevel, setCurrentLevel] = useState<Level>(LEVEL_MAP.easy);
  const [engine, setEngine] = useState<GameEngine>(() => new GameEngine(currentLevel.width, currentLevel.height, currentLevel.mines));
  const [gameState, setGameState] = useState<GameState>({
    board: engine.getBoard(),
    status: 'idle',
    elapsedTime: 0,
    flaggedCount: 0,
    revealedCount: 0,
    startTime: null
  });

  useEffect(() => {
    if (gameState.status === 'won' || gameState.status === 'lost') {
      const record: GameRecord = {
        id: `${Date.now()}`,
        level: currentLevel,
        status: gameState.status,
        elapsedTime: gameState.elapsedTime,
        timestamp: Date.now(),
        flaggedCount: gameState.flaggedCount,
        revealedCount: gameState.revealedCount
      };
      storageService.addGameRecord(record);
      
      const history = storageService.getGameHistory();
      const stats = statisticsService.calculateStatistics(history);
      storageService.updateStatistics(stats);
    }
  }, [gameState.status]);

  const revealCell = useCallback((x: number, y: number) => {
    if (gameState.status !== 'playing' && gameState.status !== 'idle') return;

    const newEngine = engine;
    let status: GameStatus = gameState.status;
    
    if (gameState.status === 'idle') {
      newEngine.placeMines(x, y);
      status = 'playing';
    }
    
    status = newEngine.revealCell(x, y);

    setGameState(prev => ({
      ...prev,
      board: newEngine.getBoard(),
      status: status,
      revealedCount: newEngine.getRevealedCount(),
      startTime: prev.startTime || Date.now()
    }));
  }, [engine, gameState.status]);

  const toggleFlag = useCallback((x: number, y: number) => {
    if (gameState.status !== 'playing' && gameState.status !== 'idle') return;

    engine.toggleFlag(x, y);
    setGameState(prev => ({
      ...prev,
      board: engine.getBoard(),
      flaggedCount: engine.getFlaggedCount()
    }));
  }, [engine, gameState.status]);

  const resetGame = useCallback(() => {
    const newEngine = new GameEngine(currentLevel.width, currentLevel.height, currentLevel.mines);
    setEngine(newEngine);
    setGameState({
      board: newEngine.getBoard(),
      status: 'idle',
      elapsedTime: 0,
      flaggedCount: 0,
      revealedCount: 0,
      startTime: null
    });
  }, [currentLevel]);

  const selectLevel = useCallback((levelId: string) => {
    const level = LEVEL_MAP[levelId as keyof typeof LEVEL_MAP];
    if (level) {
      setCurrentLevel(level);
      const newEngine = new GameEngine(level.width, level.height, level.mines);
      setEngine(newEngine);
      setGameState({
        board: newEngine.getBoard(),
        status: 'idle',
        elapsedTime: 0,
        flaggedCount: 0,
        revealedCount: 0,
        startTime: null
      });
    }
  }, []);

  return (
    <GameContext.Provider value={{ gameState, currentLevel, revealCell, toggleFlag, resetGame, selectLevel }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};