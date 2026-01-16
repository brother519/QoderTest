import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
}

export function Input({
  label,
  error,
  helper,
  required,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`${styles.inputWrapper} ${error ? styles.error : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={`${styles.label} ${required ? styles.required : ''}`}>
          {label}
        </label>
      )}
      <input id={inputId} className={styles.input} {...props} />
      {error && <span className={styles.errorMessage}>{error}</span>}
      {helper && !error && <span className={styles.helper}>{helper}</span>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
}

export function Textarea({
  label,
  error,
  helper,
  required,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`${styles.inputWrapper} ${error ? styles.error : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={`${styles.label} ${required ? styles.required : ''}`}>
          {label}
        </label>
      )}
      <textarea id={inputId} className={`${styles.input} ${styles.textarea}`} {...props} />
      {error && <span className={styles.errorMessage}>{error}</span>}
      {helper && !error && <span className={styles.helper}>{helper}</span>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  required?: boolean;
}

export function Select({
  label,
  error,
  options,
  required,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`${styles.inputWrapper} ${error ? styles.error : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className={`${styles.label} ${required ? styles.required : ''}`}>
          {label}
        </label>
      )}
      <select id={selectId} className={styles.input} {...props}>
        <option value="">请选择</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}
