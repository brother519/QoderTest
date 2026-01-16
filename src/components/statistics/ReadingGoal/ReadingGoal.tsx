import React, { useState } from 'react';
import { ProgressBar, Button, Input } from '@/components/common';
import { useStatisticsContext } from '@/context';
import { getDaysRemainingInYear } from '@/utils/date';
import styles from './ReadingGoal.module.css';

export function ReadingGoal() {
  const { readingGoal, statistics, setReadingGoal } = useStatisticsContext();
  const [isEditing, setIsEditing] = useState(false);
  const [newTarget, setNewTarget] = useState(readingGoal.targetBooks.toString());

  const completed = statistics.finishedBooks;
  const target = readingGoal.targetBooks;
  const remaining = target - completed;
  const daysRemaining = getDaysRemainingInYear();

  const handleSave = () => {
    const value = parseInt(newTarget);
    if (value > 0) {
      setReadingGoal(value);
      setIsEditing(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{readingGoal.year} 年度目标</h3>
        {!isEditing && (
          <button className={styles.editButton} onClick={() => setIsEditing(true)}>
            编辑
          </button>
        )}
      </div>

      {isEditing ? (
        <div className={styles.editForm}>
          <Input
            type="number"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            min={1}
            className={styles.editInput}
          />
          <Button size="small" onClick={handleSave}>
            保存
          </Button>
          <Button size="small" variant="secondary" onClick={() => setIsEditing(false)}>
            取消
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.stats}>
            <span className={styles.current}>{completed}</span>
            <span className={styles.target}>/ {target} 本</span>
          </div>

          <div className={styles.progress}>
            <ProgressBar value={completed} max={target} showPercentage />
          </div>

          <div className={styles.info}>
            <span>
              {remaining > 0 ? `还需读 ${remaining} 本` : '目标已完成!'}
            </span>
            <span>今年还剩 {daysRemaining} 天</span>
          </div>
        </>
      )}
    </div>
  );
}
