import React, { useState, useMemo } from 'react';
import { IoAdd, IoBook, IoTrash, IoPencil } from 'react-icons/io5';
import { useBookContext, useStatisticsContext } from '@/context';
import { Button, Modal, SearchBar, Input, ProgressBar } from '@/components/common';
import { BookList, BookForm } from '@/components/books';
import type { Book } from '@/types';
import { READING_STATUS_LABELS } from '@/types';
import styles from './LibraryPage.module.css';

export function LibraryPage() {
  const { books, addBook, updateBook, deleteBook, updateProgress } = useBookContext();
  const { recordReadingActivity } = useStatisticsContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [newCurrentPage, setNewCurrentPage] = useState('');

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const query = searchQuery.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
    );
  }, [books, searchQuery]);

  const handleAddBook = (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
    addBook(bookData);
    setShowAddModal(false);
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setNewCurrentPage(book.currentPage.toString());
    setShowDetailModal(true);
  };

  const handleUpdateProgress = () => {
    if (selectedBook) {
      const page = parseInt(newCurrentPage) || 0;
      updateProgress(selectedBook.id, page);
      recordReadingActivity();
      setSelectedBook({ ...selectedBook, currentPage: page });
    }
  };

  const handleEditBook = (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedBook) {
      updateBook(selectedBook.id, bookData);
      setShowEditModal(false);
      setShowDetailModal(false);
    }
  };

  const handleDeleteBook = () => {
    if (selectedBook && window.confirm('确定要删除这本书吗？')) {
      deleteBook(selectedBook.id);
      setShowDetailModal(false);
      setSelectedBook(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>我的书库</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <IoAdd size={18} />
          添加书籍
        </Button>
      </div>

      <div className={styles.search}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索书名或作者..."
        />
      </div>

      <BookList
        books={filteredBooks}
        onBookClick={handleBookClick}
        emptyMessage={searchQuery ? '没有找到匹配的书籍' : '书库是空的，添加第一本书吧'}
      />

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加书籍"
        size="large"
      >
        <BookForm onSubmit={handleAddBook} onCancel={() => setShowAddModal(false)} />
      </Modal>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="书籍详情"
        size="large"
      >
        {selectedBook && (
          <div className={styles.detailModal}>
            <div className={styles.detailHeader}>
              {selectedBook.coverUrl ? (
                <img
                  src={selectedBook.coverUrl}
                  alt={selectedBook.title}
                  className={styles.detailCover}
                />
              ) : (
                <div className={styles.detailCoverPlaceholder}>
                  <IoBook />
                </div>
              )}
              <div className={styles.detailInfo}>
                <h2 className={styles.detailTitle}>{selectedBook.title}</h2>
                <p className={styles.detailAuthor}>{selectedBook.author}</p>
                <div className={styles.detailMeta}>
                  <span className={styles.detailStatus}>
                    {READING_STATUS_LABELS[selectedBook.status]}
                  </span>
                  {selectedBook.category && <span>{selectedBook.category}</span>}
                  <span>{selectedBook.totalPages} 页</span>
                </div>
              </div>
            </div>

            <div className={styles.progressSection}>
              <p className={styles.progressLabel}>阅读进度</p>
              <ProgressBar
                value={selectedBook.currentPage}
                max={selectedBook.totalPages}
                label={`${selectedBook.currentPage} / ${selectedBook.totalPages} 页`}
              />
              <div className={styles.progressInput} style={{ marginTop: 'var(--spacing-md)' }}>
                <Input
                  type="number"
                  value={newCurrentPage}
                  onChange={(e) => setNewCurrentPage(e.target.value)}
                  min={0}
                  max={selectedBook.totalPages}
                  className={styles.progressInputField}
                />
                <span>页</span>
                <Button size="small" onClick={handleUpdateProgress}>
                  更新进度
                </Button>
              </div>
            </div>

            {selectedBook.description && (
              <p className={styles.description}>{selectedBook.description}</p>
            )}

            <div className={styles.actions}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDetailModal(false);
                  setShowEditModal(true);
                }}
              >
                <IoPencil size={16} />
                编辑
              </Button>
              <Button variant="danger" onClick={handleDeleteBook}>
                <IoTrash size={16} />
                删除
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="编辑书籍"
        size="large"
      >
        {selectedBook && (
          <BookForm
            initialData={selectedBook}
            onSubmit={handleEditBook}
            onCancel={() => setShowEditModal(false)}
            isEditing
          />
        )}
      </Modal>
    </div>
  );
}
