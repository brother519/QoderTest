import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  iconOnly?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  iconOnly = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    size !== 'medium' && styles[size],
    fullWidth && styles.fullWidth,
    iconOnly && styles.iconOnly,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classNames} {...props}>
      {children}
    </button>
  );
}
