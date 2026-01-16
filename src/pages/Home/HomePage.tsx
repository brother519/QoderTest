import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoBook, IoCheckmarkCircle, IoTime, IoDocumentText } from 'react-icons/io5';
import { useBookContext, useStatisticsContext } from '@/context';
import { StatisticsCard, ReadingGoal, ReadingStreak } from '@/components/statistics';
import { BookList } from '@/components/books';
import type { Book } from '@/types';
import styles from './HomePage.module.css';

export function HomePage() {
  const { books } = useBookContext();
  const { statistics } = useStatisticsContext();
  const navigate = useNavigate();

  const readingBooks = books.filter((b) => b.status === 'reading').slice(0, 3);

  const handleBookClick = (book: Book) => {
    navigate(`/library/${book.id}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <p className={styles.greeting}>欢迎回来</p>
        <h1 className={styles.title}>小白的书房</h1>
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
          icon={<IoTime />}
          value={statistics.readingBooks}
          label="在读中"
          variant="warning"
        />
        <StatisticsCard
          icon={<IoDocumentText />}
          value={statistics.totalReadPages.toLocaleString()}
          label="已读页数"
          variant="primary"
        />
      </div>

      <div className={styles.goalSection}>
        <ReadingGoal />
        <ReadingStreak />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>正在阅读</h2>
          <Link to="/library?status=reading" className={styles.viewAll}>
            查看全部
          </Link>
        </div>
        <BookList
          books={readingBooks}
          onBookClick={handleBookClick}
          showFilters={false}
          emptyMessage="还没有在读的书籍，去书库添加一本吧"
        />
      </div>
    </div>
  );
}
