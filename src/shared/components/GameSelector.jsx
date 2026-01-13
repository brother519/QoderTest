import React from 'react';
import { Link } from 'react-router-dom';
import styles from './GameSelector.module.css';

const GameSelector = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>游戏中心</h1>
      <div className={styles.gameGrid}>
        <Link to="/2048" className={styles.gameCard}>
          <div className={styles.gameIcon}>🎮</div>
          <h2>2048</h2>
          <p>经典数字合并游戏</p>
        </Link>
        <Link to="/racing" className={styles.gameCard}>
          <div className={styles.gameIcon}>🏎️</div>
          <h2>3D赛车</h2>
          <p>刺激的赛车竞速体验</p>
        </Link>
      </div>
    </div>
  );
};

export default GameSelector;
