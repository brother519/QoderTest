import React from 'react';
import './StartMenu.css';

interface StartMenuProps {
  onStart: () => void;
}

export function StartMenu({ onStart }: StartMenuProps) {
  return (
    <div className="start-menu">
      <div className="start-content">
        <h1 className="game-title">TANK BATTLE</h1>
        <div className="instructions">
          <h2>CONTROLS</h2>
          <p>Arrow Keys / WASD - Move</p>
          <p>Space / J - Shoot</p>
          <p>P - Pause</p>
        </div>
        <button onClick={onStart} className="start-button">
          START GAME
        </button>
      </div>
    </div>
  );
}
