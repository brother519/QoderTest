export interface ReadingGoal {
  year: number;
  targetBooks: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
  readingDates: string[];
}

export interface Statistics {
  totalBooks: number;
  finishedBooks: number;
  readingBooks: number;
  wantToReadBooks: number;
  totalPages: number;
  totalReadPages: number;
  averageRating: number;
  booksByCategory: Record<string, number>;
  booksByMonth: Record<string, number>;
}

export interface ReadingHistoryItem {
  date: string;
  pagesRead: number;
  booksFinished: number;
}
