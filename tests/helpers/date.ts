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
