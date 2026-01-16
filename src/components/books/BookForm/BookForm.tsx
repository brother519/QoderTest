import React, { useState } from 'react';
import { IoBook, IoSearch } from 'react-icons/io5';
import type { Book, ReadingStatus } from '@/types';
import { BOOK_CATEGORIES } from '@/types';
import { Input, Textarea, Select, Button } from '@/components/common';
import { BookSearch } from '../BookSearch';
import styles from './BookForm.module.css';

type BookFormData = Omit<Book, 'id' | 'createdAt' | 'updatedAt'>;

interface BookFormProps {
  initialData?: Partial<Book>;
  onSubmit: (data: BookFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'want_to_read', label: '想读' },
  { value: 'reading', label: '在读' },
  { value: 'finished', label: '已读' },
];

const CATEGORY_OPTIONS = BOOK_CATEGORIES.map((cat) => ({ value: cat, label: cat }));

export function BookForm({ initialData, onSubmit, onCancel, isEditing = false }: BookFormProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [formData, setFormData] = useState<BookFormData>({
    title: initialData?.title || '',
    author: initialData?.author || '',
    totalPages: initialData?.totalPages || 200,
    coverUrl: initialData?.coverUrl || '',
    category: initialData?.category || '',
    isbn: initialData?.isbn || '',
    description: initialData?.description || '',
    status: initialData?.status || 'want_to_read',
    currentPage: initialData?.currentPage || 0,
    startDate: initialData?.startDate,
    finishDate: initialData?.finishDate,
    rating: initialData?.rating,
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof BookFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSearchSelect = (book: Partial<BookFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...book,
      status: prev.status,
      currentPage: prev.currentPage,
    }));
    setShowSearch(false);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '请输入书名';
    }
    if (!formData.author.trim()) {
      newErrors.author = '请输入作者';
    }
    if (formData.totalPages <= 0) {
      newErrors.totalPages = '页数必须大于0';
    }
    if (formData.currentPage < 0) {
      newErrors.currentPage = '当前页数不能小于0';
    }
    if (formData.currentPage > formData.totalPages) {
      newErrors.currentPage = '当前页数不能超过总页数';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {!isEditing && (
        <div className={styles.searchToggle} onClick={() => setShowSearch(!showSearch)}>
          <IoSearch size={16} />
          <span>{showSearch ? '手动输入' : '从 Open Library 搜索书籍'}</span>
        </div>
      )}

      {showSearch ? (
        <BookSearch onSelect={handleSearchSelect} />
      ) : (
        <>
          <div className={styles.coverPreview}>
            {formData.coverUrl ? (
              <img
                src={formData.coverUrl}
                alt="封面预览"
                className={styles.coverImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                }}
              />
            ) : (
              <div className={styles.coverPlaceholder}>
                <IoBook size={24} />
              </div>
            )}
            <Input
              label="封面图片 URL"
              value={formData.coverUrl || ''}
              onChange={(e) => handleChange('coverUrl', e.target.value)}
              placeholder="https://..."
              style={{ flex: 1 }}
            />
          </div>

          <Input
            label="书名"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={errors.title}
            required
          />

          <div className={styles.row}>
            <Input
              label="作者"
              value={formData.author}
              onChange={(e) => handleChange('author', e.target.value)}
              error={errors.author}
              required
            />
            <Select
              label="分类"
              value={formData.category || ''}
              onChange={(e) => handleChange('category', e.target.value)}
              options={CATEGORY_OPTIONS}
            />
          </div>

          <div className={styles.row}>
            <Input
              label="总页数"
              type="number"
              value={formData.totalPages}
              onChange={(e) => handleChange('totalPages', parseInt(e.target.value) || 0)}
              error={errors.totalPages}
              min={1}
              required
            />
            <Select
              label="阅读状态"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as ReadingStatus)}
              options={STATUS_OPTIONS}
            />
          </div>

          {formData.status !== 'want_to_read' && (
            <Input
              label="当前阅读页数"
              type="number"
              value={formData.currentPage}
              onChange={(e) => handleChange('currentPage', parseInt(e.target.value) || 0)}
              error={errors.currentPage}
              min={0}
              max={formData.totalPages}
            />
          )}

          <Textarea
            label="简介"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="书籍简介..."
          />
        </>
      )}

      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">{isEditing ? '保存修改' : '添加书籍'}</Button>
      </div>
    </form>
  );
}
