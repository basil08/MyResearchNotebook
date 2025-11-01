import { format, isValid, parseISO } from 'date-fns';

/**
 * Format a date string for display
 */
export function formatDisplayDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return dateString;
    }
    return format(date, 'MMMM dd, yyyy');
  } catch {
    return dateString;
  }
}

/**
 * Format a date string for input fields (YYYY-MM-DD)
 */
export function formatInputDate(date: Date): string {
  try {
    if (!isValid(date)) {
      return format(new Date(), 'yyyy-MM-dd');
    }
    return format(date, 'yyyy-MM-dd');
  } catch {
    return format(new Date(), 'yyyy-MM-dd');
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Parse a date string to Date object
 */
export function parseDate(dateString: string): Date {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return new Date();
    }
    return date;
  } catch {
    return new Date();
  }
}

