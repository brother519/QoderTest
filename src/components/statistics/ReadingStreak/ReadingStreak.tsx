import React from 'react';
import { IoFlame, IoFlameOutline } from 'react-icons/io5';
import { useStatisticsContext } from '@/context';
import styles from './ReadingStreak.module.css';

export function ReadingStreak() {
  const { readingStreak } = useStatisticsContext();

  const isActive = readingStreak.currentStreak > 0;

  return (
    <div className={styles.card}>
      <div className={`${styles.icon} ${isActive ? styles.activeIcon : styles.inactiveIcon}`}>
        {isActive ? <IoFlame /> : <IoFlameOutline />}
      </div>

      <div className={styles.current}>{readingStreak.currentStreak}</div>
      <div className={styles.label}>连续阅读天数</div>

      {!isActive && (
        <div className={styles.inactive}>今天还没有阅读记录</div>
      )}

      <div className={styles.best}>
        最长记录: <span className={styles.bestValue}>{readingStreak.longestStreak}</span> 天
      </div>
    </div>
  );
}
