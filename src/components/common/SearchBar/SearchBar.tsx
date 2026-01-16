import React from 'react';
import { IoSearch, IoClose } from 'react-icons/io5';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = '搜索...',
  loading = false,
  className = '',
}: SearchBarProps) {
  return (
    <div className={`${styles.searchWrapper} ${className}`}>
      <div className={styles.inputWrapper}>
        <IoSearch className={styles.icon} size={18} />
        <input
          type="text"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {loading && <div className={styles.loading} />}
        {value && !loading && (
          <button className={styles.clearButton} onClick={() => onChange('')} aria-label="清除">
            <IoClose size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
