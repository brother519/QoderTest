import { useState, useCallback } from 'react';
import { GAME_CONSTANTS } from '../data/gameConstants.js';

export const useNitro = () => {
  const [nitro, setNitro] = useState(GAME_CONSTANTS.NITRO_MAX);
  const [isUsingNitro, setIsUsingNitro] = useState(false);

  const useNitro = useCallback((canUse) => {
    if (canUse && nitro > 0) {
      setIsUsingNitro(true);
    } else {
      setIsUsingNitro(false);
    }
  }, [nitro]);

  const updateNitro = useCallback((delta, isDrifting) => {
    setNitro((prev) => {
      let newNitro = prev;

      if (isUsingNitro) {
        newNitro -= GAME_CONSTANTS.NITRO_CONSUMPTION * delta;
      } else if (isDrifting) {
        newNitro += GAME_CONSTANTS.NITRO_GAIN_RATE * delta;
      }

      return Math.max(0, Math.min(GAME_CONSTANTS.NITRO_MAX, newNitro));
    });
  }, [isUsingNitro]);

  const resetNitro = useCallback(() => {
    setNitro(GAME_CONSTANTS.NITRO_MAX);
    setIsUsingNitro(false);
  }, []);

  return {
    nitro,
    isUsingNitro,
    useNitro,
    updateNitro,
    resetNitro,
  };
};
