import React, { useState, useMemo } from 'react';
import { IoLibrary } from 'react-icons/io5';
import type { Book, ReadingStatus } from '@/types';
import { READING_STATUS_LABELS } from '@/types';
import { BookCard } from '../BookCard';
import styles from './BookList.module.css';

type FilterStatus = ReadingStatus | 'all';

interface BookListProps {
  books: Book[];
  onBookClick?: (book: Book) => void;
  showFilters?: boolean;
  viewMode?: 'list' | 'grid';
  emptyMessage?: string;
}

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'reading', label: '在读' },
  { value: 'want_to_read', label: '想读' },
  { value: 'finished', label: '已读' },
];

export function BookList({
  books,
  onBookClick,
  showFilters = true,
  viewMode = 'list',
  emptyMessage = '暂无书籍',
}: BookListProps) {
  const [filter, setFilter] = useState<FilterStatus>('all');

  const filteredBooks = useMemo(() => {
    if (filter === 'all') return books;
    return books.filter((book) => book.status === filter);
  }, [books, filter]);

  const sortedBooks = useMemo(() => {
    return [...filteredBooks].sort((a, b) => {
      const statusOrder = { reading: 0, want_to_read: 1, finished: 2 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [filteredBooks]);

  return (
    <div className={styles.container}>
      {showFilters && (
        <div className={styles.filters}>
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`${styles.filterButton} ${filter === option.value ? styles.active : ''}`}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
              {option.value !== 'all' && (
                <span>
                  {' '}
                  ({books.filter((b) => b.status === option.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {sortedBooks.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <IoLibrary />
          </div>
          <p className={styles.emptyText}>{emptyMessage}</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? styles.grid : styles.list}>
          {sortedBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={() => onBookClick?.(book)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
