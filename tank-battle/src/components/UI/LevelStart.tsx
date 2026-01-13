import { useEffect } from 'react';
import './LevelStart.css';

interface LevelStartProps {
  level: number;
  onContinue: () => void;
}

export function LevelStart({ level, onContinue }: LevelStartProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="level-start-overlay">
      <div className="level-start-content">
        <h1>STAGE {level}</h1>
      </div>
    </div>
  );
}