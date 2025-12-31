import { useState, useCallback } from 'react';
import { GAME_CONSTANTS } from '../data/gameConstants.js';

export const useDrift = () => {
  const [isDrifting, setIsDrifting] = useState(false);
  const [driftScore, setDriftScore] = useState(0);
  const [driftTime, setDriftTime] = useState(0);

  const startDrift = useCallback((speed, angle) => {
    const canDrift = speed > GAME_CONSTANTS.DRIFT_SPEED_THRESHOLD && 
                     Math.abs(angle) > GAME_CONSTANTS.DRIFT_ANGLE_THRESHOLD;
    
    if (canDrift) {
      setIsDrifting(true);
    }
  }, []);

  const stopDrift = useCallback(() => {
    setIsDrifting(false);
    setDriftTime(0);
  }, []);

  const updateDrift = useCallback((delta, speed, angle) => {
    if (isDrifting) {
      setDriftTime((prev) => prev + delta);
      
      const angleScore = Math.abs(angle) / 45;
      const timeScore = driftTime * 10;
      setDriftScore((prev) => prev + (angleScore + timeScore) * delta);
    }
  }, [isDrifting, driftTime]);

  const resetDrift = useCallback(() => {
    setIsDrifting(false);
    setDriftScore(0);
    setDriftTime(0);
  }, []);

  return {
    isDrifting,
    driftScore,
    startDrift,
    stopDrift,
    updateDrift,
    resetDrift,
  };
};
