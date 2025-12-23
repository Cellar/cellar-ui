export function getRelativeDate(hoursFromNow: number, minutesFromNow = 0) {
  return new Date(
    new Date().getTime() +
      hoursFromNow * 60 * 60 * 1000 +
      minutesFromNow * 60 * 1000,
  );
}

export function getRelativeEpoch(hoursFromNow: number, minutesFromNow = 0) {
  return Math.round(
    getRelativeDate(hoursFromNow, minutesFromNow).getTime() / 1000,
  );
}

/**
 * Add days to a date (replacement for date-fns addDays)
 * @param date The date to add days to
 * @param days Number of days to add
 * @returns A new date with days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format a date (replacement for date-fns format)
 * @param date The date to format
 * @param formatStr The format string (only 'yyyy-MM-dd' is supported)
 * @returns Formatted date string
 */
export function format(date: Date, formatStr: string): string {
  if (formatStr === 'yyyy-MM-dd') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  throw new Error(`Unsupported format string: ${formatStr}`);
}
