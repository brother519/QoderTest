import React from 'react';
import './ScorePanel.css';

interface ScorePanelProps {
  score: number;
  lives: number;
  level: number;
  enemiesLeft: number;
}

export function ScorePanel({ score, lives, level, enemiesLeft }: ScorePanelProps) {
  return (
    <div className="score-panel">
      <div className="score-item">
        <span className="label">SCORE:</span>
        <span className="value">{score}</span>
      </div>
      <div className="score-item">
        <span className="label">LIVES:</span>
        <span className="value">{'♥ '.repeat(lives)}</span>
      </div>
      <div className="score-item">
        <span className="label">STAGE:</span>
        <span className="value">{level}</span>
      </div>
      <div className="score-item">
        <span className="label">ENEMIES:</span>
        <span className="value">{enemiesLeft}</span>
      </div>
    </div>
  );
}
