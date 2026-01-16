import React, { useState, useEffect } from 'react';
import { SearchBar } from '@/components/common';
import { useDebounce } from '@/hooks';
import { searchBooks, getCoverUrl, mapOpenLibraryBook, type OpenLibraryBook } from '@/api/openLibrary';
import styles from './BookSearch.module.css';

interface BookSearchProps {
  onSelect: (book: ReturnType<typeof mapOpenLibraryBook>) => void;
}

export function BookSearch({ onSelect }: BookSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OpenLibraryBook[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const books = await searchBooks(debouncedQuery, 10);
        setResults(books);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const handleSelect = (book: OpenLibraryBook) => {
    onSelect(mapOpenLibraryBook(book));
  };

  return (
    <div className={styles.container}>
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="搜索书名或作者..."
        loading={loading}
      />

      {!query && (
        <p className={styles.hint}>输入书名或作者名搜索 Open Library</p>
      )}

      {query && !loading && results.length === 0 && (
        <p className={styles.noResults}>未找到相关书籍</p>
      )}

      {results.length > 0 && (
        <div className={styles.results}>
          {results.map((book) => (
            <div
              key={book.key}
              className={styles.resultItem}
              onClick={() => handleSelect(book)}
            >
              {book.cover_i ? (
                <img
                  src={getCoverUrl(book.cover_i, 'S')}
                  alt={book.title}
                  className={styles.resultCover}
                />
              ) : (
                <div className={styles.resultCover} />
              )}
              <div className={styles.resultInfo}>
                <p className={styles.resultTitle} title={book.title}>
                  {book.title}
                </p>
                <p className={styles.resultAuthor}>
                  {book.author_name?.join(', ') || '未知作者'}
                </p>
                <p className={styles.resultMeta}>
                  {book.first_publish_year && `${book.first_publish_year}年`}
                  {book.number_of_pages_median && ` · ${book.number_of_pages_median}页`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
