import { format, parseISO, differenceInDays, startOfDay, isValid } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatDate(date: string | Date, formatStr: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, formatStr, { locale: zhCN });
}

export function formatDateCN(date: string | Date): string {
  return formatDate(date, 'yyyy年MM月dd日');
}

export function formatMonthKey(date: string | Date): string {
  return formatDate(date, 'yyyy-MM');
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getYearString(): number {
  return new Date().getFullYear();
}

export function getDaysDifference(date1: string, date2: string): number {
  return differenceInDays(parseISO(date1), parseISO(date2));
}

export function isConsecutiveDay(date1: string, date2: string): boolean {
  const diff = Math.abs(getDaysDifference(date1, date2));
  return diff === 1;
}

export function isToday(date: string): boolean {
  return date === getTodayString();
}

export function isYesterday(date: string): boolean {
  const yesterday = format(
    startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000)),
    'yyyy-MM-dd'
  );
  return date === yesterday;
}

export function getDaysRemainingInYear(): number {
  const now = new Date();
  const endOfYear = new Date(now.getFullYear(), 11, 31);
  return differenceInDays(endOfYear, now);
}
