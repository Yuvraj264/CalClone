import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Parses time string HH:mm into minutes from start of day.
 */
export const parseTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Formats minutes from start of day into HH:mm format.
 */
export const formatMinutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

/**
 * Checks if a date string is a valid ISO-8601 date.
 */
export const isValidISODate = (date: string): boolean => {
  if (!date || typeof date !== 'string') return false;
  return dayjs(date).isValid();
};

/**
 * Formats slot time.
 */
export const formatSlotTime = (date: string, time: string, tz: string): string => {
  return dayjs.tz(`${date}T${time}:00`, tz).toISOString();
};

/**
 * Checks if a slot time is in the past.
 */
export const isPastSlot = (date: string, time: string, tz: string): boolean => {
  const slotDate = dayjs.tz(`${date}T${time}:00`, tz);
  return slotDate.isBefore(dayjs());
};
