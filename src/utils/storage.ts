export const STORAGE_KEYS = {
  BOOKS: 'reading-tracker:books',
  READING_LOGS: 'reading-tracker:reading-logs',
  READING_GOAL: 'reading-tracker:reading-goal',
  READING_STREAK: 'reading-tracker:reading-streak',
  VERSION: 'reading-tracker:version',
} as const;

export const CURRENT_VERSION = '1.0.0';

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch {
    console.error(`Error loading from localStorage: ${key}`);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage: ${key}`, error);
  }
}

export function clearStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing localStorage: ${key}`, error);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
