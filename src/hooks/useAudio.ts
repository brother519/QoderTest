import { useEffect, useState } from 'react';

export const useAudio = (enabled: boolean = true) => {
  const [isEnabled, setIsEnabled] = useState(enabled);

  const play = (soundName: string) => {
    if (!isEnabled) return;
    
    try {
      const audio = new Audio(`/sounds/${soundName}.mp3`);
      audio.play().catch(() => {
        // Silently fail if audio can't be played
      });
    } catch (error) {
      // Silently fail
    }
  };

  return { play, isEnabled, setIsEnabled };
};
