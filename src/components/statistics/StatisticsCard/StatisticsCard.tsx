import React from 'react';
import styles from './StatisticsCard.module.css';

interface StatisticsCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  variant?: 'primary' | 'secondary' | 'warning';
}

export function StatisticsCard({
  icon,
  value,
  label,
  variant = 'primary',
}: StatisticsCardProps) {
  const iconClass = {
    primary: styles.iconPrimary,
    secondary: styles.iconSecondary,
    warning: styles.iconWarning,
  }[variant];

  return (
    <div className={styles.card}>
      <div className={`${styles.icon} ${iconClass}`}>{icon}</div>
      <div className={styles.content}>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
      </div>
    </div>
  );
}
