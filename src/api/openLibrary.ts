export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  isbn?: string[];
  first_publish_year?: number;
  number_of_pages_median?: number;
  subject?: string[];
}

export interface OpenLibrarySearchResponse {
  numFound: number;
  docs: OpenLibraryBook[];
}

const BASE_URL = 'https://openlibrary.org';
const COVER_BASE_URL = 'https://covers.openlibrary.org/b/id';

export async function searchBooks(query: string, limit: number = 10): Promise<OpenLibraryBook[]> {
  if (!query.trim()) return [];

  try {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      fields: 'key,title,author_name,cover_i,isbn,first_publish_year,number_of_pages_median,subject',
    });

    const response = await fetch(`${BASE_URL}/search.json?${params}`);
    if (!response.ok) throw new Error('Search failed');

    const data: OpenLibrarySearchResponse = await response.json();
    return data.docs;
  } catch (error) {
    console.error('Open Library search error:', error);
    return [];
  }
}

export function getCoverUrl(coverId: number, size: 'S' | 'M' | 'L' = 'M'): string {
  return `${COVER_BASE_URL}/${coverId}-${size}.jpg`;
}

export function mapOpenLibraryBook(olBook: OpenLibraryBook) {
  return {
    title: olBook.title,
    author: olBook.author_name?.[0] || '未知作者',
    totalPages: olBook.number_of_pages_median || 200,
    coverUrl: olBook.cover_i ? getCoverUrl(olBook.cover_i, 'M') : undefined,
    isbn: olBook.isbn?.[0],
    category: mapSubjectToCategory(olBook.subject),
  };
}

function mapSubjectToCategory(subjects?: string[]): string {
  if (!subjects || subjects.length === 0) return '其他';

  const subjectLower = subjects.map((s) => s.toLowerCase());

  if (subjectLower.some((s) => s.includes('fiction') || s.includes('novel'))) return '小说';
  if (subjectLower.some((s) => s.includes('history'))) return '历史';
  if (subjectLower.some((s) => s.includes('philosophy'))) return '哲学';
  if (subjectLower.some((s) => s.includes('psychology'))) return '心理学';
  if (subjectLower.some((s) => s.includes('economics') || s.includes('business'))) return '经济';
  if (subjectLower.some((s) => s.includes('programming') || s.includes('computer'))) return '编程';
  if (subjectLower.some((s) => s.includes('science fiction'))) return '科幻';
  if (subjectLower.some((s) => s.includes('mystery') || s.includes('thriller'))) return '悬疑';
  if (subjectLower.some((s) => s.includes('biography'))) return '传记';

  return '其他';
}
