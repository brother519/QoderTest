import { useEffect } from 'react';
import { DIRECTIONS } from '../logic/constants.js';

export function useKeyboard(onMove) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const keyMap = {
        'ArrowUp': DIRECTIONS.UP,
        'ArrowDown': DIRECTIONS.DOWN,
        'ArrowLeft': DIRECTIONS.LEFT,
        'ArrowRight': DIRECTIONS.RIGHT,
        'w': DIRECTIONS.UP,
        'W': DIRECTIONS.UP,
        's': DIRECTIONS.DOWN,
        'S': DIRECTIONS.DOWN,
        'a': DIRECTIONS.LEFT,
        'A': DIRECTIONS.LEFT,
        'd': DIRECTIONS.RIGHT,
        'D': DIRECTIONS.RIGHT,
      };

      const direction = keyMap[e.key];
      
      if (direction) {
        e.preventDefault();
        onMove(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onMove]);
}
