import type { Book, ReadingLog } from '@/types';
import type { Statistics, ReadingStreak } from '@/types';
import { formatMonthKey, isConsecutiveDay, isToday, isYesterday, getTodayString } from './date';

export function calculateStatistics(books: Book[], _readingLogs: ReadingLog[]): Statistics {
  const finishedBooks = books.filter((b) => b.status === 'finished');
  const readingBooks = books.filter((b) => b.status === 'reading');
  const wantToReadBooks = books.filter((b) => b.status === 'want_to_read');

  const totalPages = books.reduce((sum, b) => sum + b.totalPages, 0);
  const totalReadPages = books.reduce((sum, b) => sum + b.currentPage, 0);

  const ratedBooks = finishedBooks.filter((b) => b.rating !== undefined && b.rating > 0);
  const averageRating =
    ratedBooks.length > 0
      ? ratedBooks.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedBooks.length
      : 0;

  const booksByCategory: Record<string, number> = {};
  books.forEach((book) => {
    const category = book.category || '其他';
    booksByCategory[category] = (booksByCategory[category] || 0) + 1;
  });

  const booksByMonth: Record<string, number> = {};
  finishedBooks.forEach((book) => {
    if (book.finishDate) {
      const monthKey = formatMonthKey(book.finishDate);
      booksByMonth[monthKey] = (booksByMonth[monthKey] || 0) + 1;
    }
  });

  return {
    totalBooks: books.length,
    finishedBooks: finishedBooks.length,
    readingBooks: readingBooks.length,
    wantToReadBooks: wantToReadBooks.length,
    totalPages,
    totalReadPages,
    averageRating: Math.round(averageRating * 10) / 10,
    booksByCategory,
    booksByMonth,
  };
}

export function calculateStreak(readingDates: string[]): ReadingStreak {
  if (readingDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: null,
      readingDates: [],
    };
  }

  const sortedDates = [...new Set(readingDates)].sort().reverse();
  const lastReadDate = sortedDates[0];

  let currentStreak = 0;
  if (isToday(lastReadDate) || isYesterday(lastReadDate)) {
    currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      if (isConsecutiveDay(sortedDates[i - 1], sortedDates[i])) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  let longestStreak = 1;
  let tempStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    if (isConsecutiveDay(sortedDates[i - 1], sortedDates[i])) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    lastReadDate,
    readingDates: sortedDates,
  };
}

export function updateStreakWithNewDate(streak: ReadingStreak, date?: string): ReadingStreak {
  const newDate = date || getTodayString();
  const newDates = [...new Set([...streak.readingDates, newDate])];
  return calculateStreak(newDates);
}

export function getRecommendedCategories(books: Book[]): string[] {
  const categoryCount: Record<string, number> = {};
  const finishedBooks = books.filter((b) => b.status === 'finished');

  finishedBooks.forEach((book) => {
    const category = book.category || '其他';
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });

  return Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);
}
