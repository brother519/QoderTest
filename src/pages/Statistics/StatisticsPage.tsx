import React from 'react';
import { IoBook, IoCheckmarkCircle, IoStar, IoDocumentText } from 'react-icons/io5';
import { useStatisticsContext } from '@/context';
import {
  ReadingGoal,
  ReadingStreak,
  StatisticsCard,
  ReadingChart,
} from '@/components/statistics';
import styles from './StatisticsPage.module.css';

export function StatisticsPage() {
  const { statistics } = useStatisticsContext();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>阅读统计</h1>

      <div className={styles.goalSection}>
        <ReadingGoal />
        <ReadingStreak />
      </div>

      <div className={styles.statsGrid}>
        <StatisticsCard
          icon={<IoBook />}
          value={statistics.totalBooks}
          label="书籍总数"
          variant="primary"
        />
        <StatisticsCard
          icon={<IoCheckmarkCircle />}
          value={statistics.finishedBooks}
          label="已读完"
          variant="secondary"
        />
        <StatisticsCard
          icon={<IoDocumentText />}
          value={statistics.totalReadPages.toLocaleString()}
          label="已读页数"
          variant="primary"
        />
        <StatisticsCard
          icon={<IoStar />}
          value={statistics.averageRating > 0 ? statistics.averageRating.toFixed(1) : '-'}
          label="平均评分"
          variant="warning"
        />
      </div>

      <div className={styles.chartsGrid}>
        <ReadingChart type="monthly" />
        <ReadingChart type="category" />
      </div>
    </div>
  );
}
