import React from 'react';
import './GameOver.css';

interface GameOverProps {
  score: number;
  onRestart: () => void;
}

export function GameOver({ score, onRestart }: GameOverProps) {
  return (
    <div className="game-over-overlay">
      <div className="game-over-content">
        <h1>GAME OVER</h1>
        <p className="final-score">Final Score: {score}</p>
        <button onClick={onRestart}>Press ENTER to Restart</button>
      </div>
    </div>
  );
}
