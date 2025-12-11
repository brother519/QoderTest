import React from 'react';
import './PauseMenu.css';

interface PauseMenuProps {
  onResume: () => void;
}

export function PauseMenu({ onResume }: PauseMenuProps) {
  return (
    <div className="pause-overlay">
      <div className="pause-content">
        <h1>PAUSED</h1>
        <p>Press P to Resume</p>
      </div>
    </div>
  );
}
