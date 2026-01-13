import React from 'react';
import styles from './Speedometer.module.css';

const Speedometer = ({ speed }) => {
  const displaySpeed = Math.round(speed);
  const rotation = Math.min((speed / 250) * 180, 180);

  return (
    <div className={styles.speedometer}>
      <div className={styles.dial}>
        <div 
          className={styles.needle} 
          style={{ transform: `rotate(${rotation - 90}deg)` }}
        />
        <div className={styles.center} />
      </div>
      <div className={styles.speedValue}>
        <span className={styles.speed}>{displaySpeed}</span>
        <span className={styles.unit}>km/h</span>
      </div>
    </div>
  );
};

export default Speedometer;
