import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { parseTimeToMinutes, formatMinutesToTime } from './dateTime';

dayjs.extend(utc);
dayjs.extend(timezone);

interface SlotGeneratorOptions {
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  duration: number;  // in minutes
  bookings: { startTime: Date; endTime: Date }[];
  date: string;      // "YYYY-MM-DD"
  timezone: string;  // host/event timezone
}

/**
 * High-performance, dynamic slot generation algorithm.
 * Generates bookable slots on a 24hr grid and filters out booked allocations.
 */
export function generateIntervalSlots(options: SlotGeneratorOptions): string[] {
  const { startTime, endTime, duration, bookings, date, timezone: tz } = options;
  
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  const slots: string[] = [];

  let currentMinutes = startMinutes;

  while (currentMinutes + duration <= endMinutes) {
    const slotTimeStr = formatMinutesToTime(currentMinutes);
    const slotDateTime = dayjs.tz(`${date}T${slotTimeStr}:00`, tz);
    
    // 1. Verify slot is in the future
    const isPast = slotDateTime.isBefore(dayjs());

    if (!isPast) {
      const slotStart = slotDateTime.toDate();
      const slotEnd = slotDateTime.add(duration, 'minute').toDate();

      let isBooked = false;

      // 2. Perform overlap checks against active bookings
      for (const booking of bookings) {
        const bookStart = new Date(booking.startTime);
        const bookEnd = new Date(booking.endTime);

        if (slotStart < bookEnd && slotEnd > bookStart) {
          isBooked = true;
          break;
        }
      }

      if (!isBooked) {
        slots.push(slotTimeStr);
      }
    }

    currentMinutes += duration;
  }

  return slots;
}
