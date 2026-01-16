import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'success' | 'warning';
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'medium',
  color = 'primary',
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayColor = percentage >= 100 ? 'success' : color;

  return (
    <div
      className={`${styles.progressWrapper} ${size !== 'medium' ? styles[size] : ''} ${className}`}
    >
      {(label || showPercentage) && (
        <div className={styles.label}>
          <span>{label}</span>
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${styles[displayColor]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
