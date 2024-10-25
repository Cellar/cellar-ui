export function padNum(num: number, digits: number): string {
  if (digits < 1)
    return ''

  if (num >= 10 ** (digits - 1))
    return num.toString()

  return '0' + padNum(num, digits - 1)
}

export function formatDate(date: Date | string): string {
  if (typeof date === 'string')
    date = new Date(date)
  return `${date.getFullYear()}-${padNum(date.getMonth(), 2)}-${padNum(date.getDate(), 2)}`
}

export function formatTime(date: Date | string): string {
  if (typeof date === 'string')
    date = new Date(date)
  let hours = date.getHours()
  const amPm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  return `${padNum(hours, 2)}:${padNum(date.getMinutes(), 2)} ${amPm}`
}

export function formatDateAndTime(date: Date | string): string {
  if (typeof date === 'string')
    date = new Date(date)
  const formattedDate = formatDate(date)
  const formattedTime = formatTime(date)
  const timezone = getTimeZone(date)
  return `${formattedDate} ${formattedTime} ${timezone}`
}

export function getTimeZone(date: Date | string): string {
  if (typeof date === 'string')
    date = new Date(date)
  const parts = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(date);
  return parts.find(p => p.type === 'timeZoneName')?.value ?? "   ";
}
