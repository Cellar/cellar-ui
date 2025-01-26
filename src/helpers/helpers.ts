export function padNum(num: number, digits: number): string {
  if (digits < 1) return '';

  if (num >= 10 ** (digits - 1)) return num.toString();

  return '0' + padNum(num, digits - 1);
}

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') date = new Date(date);

  return date.toLocaleDateString(navigator.language, {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  if (typeof date === 'string') date = new Date(date);

  return date.toLocaleTimeString(navigator.language, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateAndTime(date: Date | string): string {
  if (typeof date === 'string') date = new Date(date);
  const formattedDate = formatDate(date);
  const formattedTime = formatTime(date);
  const timezone = getTimeZone(date);
  return `${formattedDate} ${formattedTime} ${timezone}`;
}

export function getTimeZone(date: Date | string): string {
  if (typeof date === 'string') date = new Date(date);
  const parts = new Intl.DateTimeFormat(navigator.language, {
    timeZoneName: 'short',
  }).formatToParts(date);
  return parts.find((p) => p.type === 'timeZoneName')?.value ?? '   ';
}
