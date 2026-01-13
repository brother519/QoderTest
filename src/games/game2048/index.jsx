import React from 'react';
import Game from './components/Game/Game.jsx';
import styles from './App.module.css';

function Game2048() {
  return (
    <div className={styles.app}>
      <Game />
    </div>
  );
}

export default Game2048;
