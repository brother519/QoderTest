import { useEffect, useState } from 'react';
import { CONTROLS } from '../data/gameConstants.js';

export const useCarControls = () => {
  const [controls, setControls] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    nitro: false,
    drift: false,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      setControls((prev) => {
        const newControls = { ...prev };
        
        if (CONTROLS.FORWARD.includes(e.key)) newControls.forward = true;
        if (CONTROLS.BACKWARD.includes(e.key)) newControls.backward = true;
        if (CONTROLS.LEFT.includes(e.key)) newControls.left = true;
        if (CONTROLS.RIGHT.includes(e.key)) newControls.right = true;
        if (CONTROLS.NITRO.includes(e.key)) newControls.nitro = true;
        if (CONTROLS.DRIFT.includes(e.key)) newControls.drift = true;
        
        return newControls;
      });
    };

    const handleKeyUp = (e) => {
      setControls((prev) => {
        const newControls = { ...prev };
        
        if (CONTROLS.FORWARD.includes(e.key)) newControls.forward = false;
        if (CONTROLS.BACKWARD.includes(e.key)) newControls.backward = false;
        if (CONTROLS.LEFT.includes(e.key)) newControls.left = false;
        if (CONTROLS.RIGHT.includes(e.key)) newControls.right = false;
        if (CONTROLS.NITRO.includes(e.key)) newControls.nitro = false;
        if (CONTROLS.DRIFT.includes(e.key)) newControls.drift = false;
        
        return newControls;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return controls;
};
