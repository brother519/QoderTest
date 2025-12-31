import { useState, useCallback, useRef } from 'react';
import { GAME_STATES, GAME_CONSTANTS } from '../data/gameConstants.js';

export const useGameState = () => {
  const [gameState, setGameState] = useState(GAME_STATES.NOT_STARTED);
  const [currentLap, setCurrentLap] = useState(1);
  const [checkpointsPassed, setCheckpointsPassed] = useState([]);
  const [lapTimes, setLapTimes] = useState([]);
  const [bestLapTime, setBestLapTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const lapStartTime = useRef(Date.now());

  const startGame = useCallback(() => {
    setGameState(GAME_STATES.COUNTDOWN);
    setTimeout(() => {
      setGameState(GAME_STATES.RACING);
      lapStartTime.current = Date.now();
    }, 3000);
  }, []);

  const handleCheckpoint = useCallback((checkpointIndex) => {
    setCheckpointsPassed((prev) => {
      if (prev.includes(checkpointIndex)) return prev;
      
      const newPassed = [...prev, checkpointIndex];
      
      if (newPassed.length === 6) {
        const lapTime = Date.now() - lapStartTime.current;
        setLapTimes((prevTimes) => [...prevTimes, lapTime]);
        
        if (bestLapTime === 0 || lapTime < bestLapTime) {
          setBestLapTime(lapTime);
        }
        
        if (currentLap < GAME_CONSTANTS.TOTAL_LAPS) {
          setCurrentLap((prev) => prev + 1);
          setCheckpointsPassed([]);
          lapStartTime.current = Date.now();
        } else {
          setGameState(GAME_STATES.FINISHED);
        }
        
        return [];
      }
      
      return newPassed;
    });
  }, [currentLap, bestLapTime]);

  const updateTime = useCallback((delta) => {
    if (gameState === GAME_STATES.RACING) {
      setTotalTime((prev) => prev + delta * 1000);
    }
  }, [gameState]);

  const resetGame = useCallback(() => {
    setGameState(GAME_STATES.NOT_STARTED);
    setCurrentLap(1);
    setCheckpointsPassed([]);
    setLapTimes([]);
    setTotalTime(0);
    lapStartTime.current = Date.now();
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(GAME_STATES.PAUSED);
  }, []);

  const resumeGame = useCallback(() => {
    setGameState(GAME_STATES.RACING);
  }, []);

  return {
    gameState,
    currentLap,
    totalTime,
    bestLapTime,
    lapTimes,
    startGame,
    handleCheckpoint,
    updateTime,
    resetGame,
    pauseGame,
    resumeGame,
  };
};
