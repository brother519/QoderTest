import React, { createContext, useContext, useCallback, useMemo } from 'react';
import type { Book, ReadingLog } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS, generateId } from '@/utils/storage';
import { getTodayString } from '@/utils/date';

interface BookContextType {
  books: Book[];
  readingLogs: ReadingLog[];
  addBook: (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => Book;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  updateProgress: (id: string, currentPage: number) => void;
  addReadingLog: (bookId: string, pagesRead: number, notes?: string) => void;
  getBookById: (id: string) => Book | undefined;
}

const BookContext = createContext<BookContextType | null>(null);

export function BookProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useLocalStorage<Book[]>(STORAGE_KEYS.BOOKS, []);
  const [readingLogs, setReadingLogs] = useLocalStorage<ReadingLog[]>(
    STORAGE_KEYS.READING_LOGS,
    []
  );

  const addBook = useCallback(
    (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Book => {
      const now = new Date().toISOString();
      const newBook: Book = {
        ...bookData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      setBooks((prev) => [...prev, newBook]);
      return newBook;
    },
    [setBooks]
  );

  const updateBook = useCallback(
    (id: string, updates: Partial<Book>) => {
      setBooks((prev) =>
        prev.map((book) =>
          book.id === id
            ? { ...book, ...updates, updatedAt: new Date().toISOString() }
            : book
        )
      );
    },
    [setBooks]
  );

  const deleteBook = useCallback(
    (id: string) => {
      setBooks((prev) => prev.filter((book) => book.id !== id));
      setReadingLogs((prev) => prev.filter((log) => log.bookId !== id));
    },
    [setBooks, setReadingLogs]
  );

  const updateProgress = useCallback(
    (id: string, currentPage: number) => {
      setBooks((prev) =>
        prev.map((book) => {
          if (book.id !== id) return book;

          const now = new Date().toISOString();
          const updates: Partial<Book> = {
            currentPage,
            updatedAt: now,
          };

          if (currentPage > 0 && book.status === 'want_to_read') {
            updates.status = 'reading';
            updates.startDate = getTodayString();
          }

          if (currentPage >= book.totalPages && book.status !== 'finished') {
            updates.status = 'finished';
            updates.finishDate = getTodayString();
            updates.currentPage = book.totalPages;
          }

          return { ...book, ...updates };
        })
      );
    },
    [setBooks]
  );

  const addReadingLog = useCallback(
    (bookId: string, pagesRead: number, notes?: string) => {
      const newLog: ReadingLog = {
        id: generateId(),
        bookId,
        date: getTodayString(),
        pagesRead,
        notes,
      };
      setReadingLogs((prev) => [...prev, newLog]);
    },
    [setReadingLogs]
  );

  const getBookById = useCallback(
    (id: string) => books.find((book) => book.id === id),
    [books]
  );

  const value = useMemo(
    () => ({
      books,
      readingLogs,
      addBook,
      updateBook,
      deleteBook,
      updateProgress,
      addReadingLog,
      getBookById,
    }),
    [books, readingLogs, addBook, updateBook, deleteBook, updateProgress, addReadingLog, getBookById]
  );

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
}

export function useBookContext() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBookContext must be used within a BookProvider');
  }
  return context;
}
