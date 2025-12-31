import React from 'react';
import styles from './ScoreBoard.module.css';

const ScoreBoard = ({ score, bestScore }) => {
  return (
    <div className={styles.scoreBoard}>
      <div className={styles.scoreBox}>
        <div className={styles.label}>分数</div>
        <div className={styles.value}>{score}</div>
      </div>
      <div className={styles.scoreBox}>
        <div className={styles.label}>最高分</div>
        <div className={styles.value}>{bestScore}</div>
      </div>
    </div>
  );
};

export default ScoreBoard;
