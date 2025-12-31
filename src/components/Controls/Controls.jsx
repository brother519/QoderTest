import React from 'react';
import styles from './Controls.module.css';

const Controls = ({ onNewGame }) => {
  return (
    <div className={styles.controls}>
      <button className={styles.newGameButton} onClick={onNewGame}>
        新游戏
      </button>
    </div>
  );
};

export default Controls;
