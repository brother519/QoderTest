import React, { createContext, useContext, useCallback, useMemo, useEffect } from 'react';
import type { ReadingGoal, ReadingStreak, Statistics } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/utils/storage';
import { getYearString, getTodayString } from '@/utils/date';
import { calculateStatistics, calculateStreak, updateStreakWithNewDate } from '@/utils/statistics';
import { useBookContext } from './BookContext';

interface StatisticsContextType {
  readingGoal: ReadingGoal;
  readingStreak: ReadingStreak;
  statistics: Statistics;
  setReadingGoal: (targetBooks: number) => void;
  recordReadingActivity: () => void;
  resetYearlyGoal: () => void;
}

const defaultGoal: ReadingGoal = {
  year: getYearString(),
  targetBooks: 12,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const defaultStreak: ReadingStreak = {
  currentStreak: 0,
  longestStreak: 0,
  lastReadDate: null,
  readingDates: [],
};

const defaultStatistics: Statistics = {
  totalBooks: 0,
  finishedBooks: 0,
  readingBooks: 0,
  wantToReadBooks: 0,
  totalPages: 0,
  totalReadPages: 0,
  averageRating: 0,
  booksByCategory: {},
  booksByMonth: {},
};

const StatisticsContext = createContext<StatisticsContextType | null>(null);

export function StatisticsProvider({ children }: { children: React.ReactNode }) {
  const { books, readingLogs } = useBookContext();

  const [readingGoal, setReadingGoalState] = useLocalStorage<ReadingGoal>(
    STORAGE_KEYS.READING_GOAL,
    defaultGoal
  );

  const [readingStreak, setReadingStreak] = useLocalStorage<ReadingStreak>(
    STORAGE_KEYS.READING_STREAK,
    defaultStreak
  );

  const statistics = useMemo(() => {
    if (books.length === 0) return defaultStatistics;
    return calculateStatistics(books, readingLogs);
  }, [books, readingLogs]);

  useEffect(() => {
    const currentYear = getYearString();
    if (readingGoal.year !== currentYear) {
      setReadingGoalState({
        ...defaultGoal,
        year: currentYear,
      });
    }
  }, [readingGoal.year, setReadingGoalState]);

  const setReadingGoal = useCallback(
    (targetBooks: number) => {
      setReadingGoalState((prev) => ({
        ...prev,
        targetBooks,
        updatedAt: new Date().toISOString(),
      }));
    },
    [setReadingGoalState]
  );

  const recordReadingActivity = useCallback(() => {
    const today = getTodayString();
    if (readingStreak.lastReadDate !== today) {
      const newStreak = updateStreakWithNewDate(readingStreak, today);
      setReadingStreak(newStreak);
    }
  }, [readingStreak, setReadingStreak]);

  const resetYearlyGoal = useCallback(() => {
    setReadingGoalState({
      ...defaultGoal,
      year: getYearString(),
    });
  }, [setReadingGoalState]);

  useEffect(() => {
    const newStreak = calculateStreak(readingStreak.readingDates);
    if (newStreak.currentStreak !== readingStreak.currentStreak) {
      setReadingStreak(newStreak);
    }
  }, []);

  const value = useMemo(
    () => ({
      readingGoal,
      readingStreak,
      statistics,
      setReadingGoal,
      recordReadingActivity,
      resetYearlyGoal,
    }),
    [readingGoal, readingStreak, statistics, setReadingGoal, recordReadingActivity, resetYearlyGoal]
  );

  return <StatisticsContext.Provider value={value}>{children}</StatisticsContext.Provider>;
}

export function useStatisticsContext() {
  const context = useContext(StatisticsContext);
  if (!context) {
    throw new Error('useStatisticsContext must be used within a StatisticsProvider');
  }
  return context;
}
