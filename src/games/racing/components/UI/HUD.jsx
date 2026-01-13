import React from 'react';
import styles from './HUD.module.css';
import Speedometer from './Speedometer.jsx';
import Timer from './Timer.jsx';

const HUD = ({ speed, nitro, currentLap, totalLaps, time, bestLap }) => {
  return (
    <div className={styles.hud}>
      <div className={styles.topLeft}>
        <Timer time={time} bestLap={bestLap} />
        <div className={styles.lapCounter}>
          圈数: {currentLap} / {totalLaps}
        </div>
      </div>

      <div className={styles.bottomCenter}>
        <Speedometer speed={speed} />
      </div>

      <div className={styles.bottomRight}>
        <div className={styles.nitroBar}>
          <div className={styles.nitroLabel}>氮气</div>
          <div className={styles.nitroBarContainer}>
            <div 
              className={styles.nitroBarFill} 
              style={{ width: `${nitro}%` }}
            />
          </div>
          <div className={styles.nitroValue}>{Math.round(nitro)}%</div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlHint}>
          <kbd>W/↑</kbd> 加速 <kbd>S/↓</kbd> 刹车 
          <kbd>A/←</kbd> 左转 <kbd>D/→</kbd> 右转
          <kbd>Shift</kbd> 氮气 <kbd>Space</kbd> 漂移
        </div>
      </div>
    </div>
  );
};

export default HUD;
