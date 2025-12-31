import React from 'react';
import styles from './Timer.module.css';

const Timer = ({ time, bestLap }) => {
  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.timer}>
      <div className={styles.currentTime}>
        <span className={styles.label}>时间:</span>
        <span className={styles.time}>{formatTime(time)}</span>
      </div>
      {bestLap > 0 && (
        <div className={styles.bestLap}>
          <span className={styles.label}>最佳:</span>
          <span className={styles.time}>{formatTime(bestLap)}</span>
        </div>
      )}
    </div>
  );
};

export default Timer;
