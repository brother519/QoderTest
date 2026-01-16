import React from 'react';
import { IoBook } from 'react-icons/io5';
import type { Book } from '@/types';
import { READING_STATUS_LABELS } from '@/types';
import { ProgressBar } from '@/components/common';
import styles from './BookCard.module.css';

interface BookCardProps {
  book: Book;
  onClick?: () => void;
  showProgress?: boolean;
}

export function BookCard({ book, onClick, showProgress = true }: BookCardProps) {
  const progress = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;

  const statusClass = {
    want_to_read: styles.statusWant,
    reading: styles.statusReading,
    finished: styles.statusFinished,
  }[book.status];

  return (
    <div className={styles.bookCard} onClick={onClick}>
      <div className={styles.cover}>
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className={styles.coverImage}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove(styles.hidden);
            }}
          />
        ) : (
          <div className={styles.coverPlaceholder}>
            <IoBook />
          </div>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title} title={book.title}>
          {book.title}
        </h3>
        <p className={styles.author}>{book.author}</p>
        <div className={styles.meta}>
          <span className={`${styles.status} ${statusClass}`}>
            {READING_STATUS_LABELS[book.status]}
          </span>
          {book.category && <span className={styles.category}>{book.category}</span>}
        </div>
        {showProgress && book.status !== 'want_to_read' && (
          <div className={styles.progress}>
            <ProgressBar
              value={book.currentPage}
              max={book.totalPages}
              label={`${book.currentPage} / ${book.totalPages} 页`}
              size="small"
            />
          </div>
        )}
      </div>
    </div>
  );
}
