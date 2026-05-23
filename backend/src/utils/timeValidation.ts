const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Validates whether a string matches the 24-hour HH:mm time format.
 */
export const isValidTimeFormat = (time: string): boolean => {
  return typeof time === 'string' && timeRegex.test(time);
};

/**
 * Compares two HH:mm times.
 * @returns -1 if timeA < timeB, 0 if equal, 1 if timeA > timeB.
 */
export const compareTimes = (timeA: string, timeB: string): number => {
  const [hoursA, minutesA] = timeA.split(':').map(Number);
  const [hoursB, minutesB] = timeB.split(':').map(Number);

  if (hoursA < hoursB) return -1;
  if (hoursA > hoursB) return 1;

  if (minutesA < minutesB) return -1;
  if (minutesA > minutesB) return 1;

  return 0;
};

/**
 * Validates whether a time range is logically valid (both format correct and startTime < endTime).
 */
export const isValidTimeRange = (startTime: string, endTime: string): boolean => {
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return false;
  }
  return compareTimes(startTime, endTime) < 0;
};
