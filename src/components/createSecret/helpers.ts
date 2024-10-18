export function padNum(num: number, digits: number): string {
  if (digits < 1)
    return ''

  if (num >= 10 ** (digits - 1))
    return num.toString()

  return '0' + padNum(num, digits - 1)
}
