export type ReadingStatus = 'want_to_read' | 'reading' | 'finished';

export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  coverUrl?: string;
  category?: string;
  isbn?: string;
  description?: string;
  status: ReadingStatus;
  currentPage: number;
  startDate?: string;
  finishDate?: string;
  rating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingLog {
  id: string;
  bookId: string;
  date: string;
  pagesRead: number;
  notes?: string;
}

export const READING_STATUS_LABELS: Record<ReadingStatus, string> = {
  want_to_read: '想读',
  reading: '在读',
  finished: '已读',
};

export const BOOK_CATEGORIES = [
  '小说',
  '文学',
  '历史',
  '哲学',
  '心理学',
  '经济',
  '科技',
  '编程',
  '传记',
  '科幻',
  '悬疑',
  '其他',
];
