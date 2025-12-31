import React from 'react';
import { useTimer } from '../../hooks/useTimer';
import './GameHeader.css';

interface GameHeaderProps {
  time: number;
  flaggedCount: number;
  totalMines: number;
  difficulty: string;
}

const GameHeader: React.FC<GameHeaderProps> = ({ time, flaggedCount, totalMines, difficulty }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="game-header">
      <div className="header-item">
        <span className="label">难度:</span>
        <span className="value">{difficulty}</span>
      </div>
      
      <div className="header-item">
        <span className="label">⏱️</span>
        <span className="value">{formatTime(time)}</span>
      </div>
      
      <div className="header-item">
        <span className="label">地雷数:</span>
        <span className="value">{totalMines - flaggedCount}</span>
      </div>
    </div>
  );
};

export default GameHeader;
