import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface WeeklyAvailability {
  dayOfWeek: number;
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  active: boolean;
}

interface DateOverride {
  date: string; // "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  blocked: boolean;
}

interface ExistingBooking {
  startTime: Date;
  endTime: Date;
}

/**
 * Dynamically computes open, bookable time periods on a host's calendar for a visitor.
 */
export function generateSlots({
  targetDate,
  duration,
  bufferTime,
  hostTimezone,
  weeklySchedule,
  dateOverrides,
  existingBookings
}: {
  targetDate: string;
  duration: number;
  bufferTime: number;
  hostTimezone: string;
  weeklySchedule: WeeklyAvailability[];
  dateOverrides: DateOverride[];
  existingBookings: ExistingBooking[];
}): string[] {
  
  // 1. Resolve host active working range for target date (applying overrides first)
  const override = dateOverrides.find(o => o.date === targetDate);
  let periods: { start: string; end: string }[] = [];

  if (override) {
    if (override.blocked) return []; // Fully blocked today
    periods.push({ start: override.startTime, end: override.endTime });
  } else {
    const dayOfWeek = dayjs(targetDate).day();
    const daySchedule = weeklySchedule.find(s => s.dayOfWeek === dayOfWeek && s.active);
    if (!daySchedule) return []; // Not working this day
    periods.push({ start: daySchedule.startTime, end: daySchedule.endTime });
  }

  const bookableSlots: string[] = [];

  // 2. Process bookable blocks
  for (const period of periods) {
    // Generate dayjs objects for host times relative to targetDate in Host's timezone
    const hostStart = dayjs.tz(`${targetDate}T${period.start}:00`, hostTimezone);
    const hostEnd = dayjs.tz(`${targetDate}T${period.end}:00`, hostTimezone);

    let currentSlotStart = hostStart;
    const intervalDelta = duration + bufferTime;

    while (currentSlotStart.add(duration, 'minute').isSameOrBefore(hostEnd)) {
      const currentSlotEnd = currentSlotStart.add(duration, 'minute');
      
      // Determine slot overlap with existing bookings (fully converted to UTC comparisons)
      const slotStartUTC = currentSlotStart.utc();
      const slotEndUTC = currentSlotEnd.utc();

      let hasOverlap = false;

      for (const booking of existingBookings) {
        const bookStartUTC = dayjs(booking.startTime).utc();
        const bookEndUTC = dayjs(booking.endTime).utc();

        // Calculate overlap applying event buffers
        const paddedBookingStart = bookStartUTC.subtract(bufferTime, 'minute');
        const paddedBookingEnd = bookEndUTC.add(bufferTime, 'minute');

        // Check if slot overlaps with padded booking window
        if (
          (slotStartUTC.isBefore(paddedBookingEnd) && slotEndUTC.isAfter(paddedBookingStart))
        ) {
          hasOverlap = true;
          break;
        }
      }

      // Ensure booking target slot is in the future
      if (!hasOverlap && slotStartUTC.isAfter(dayjs().utc())) {
        // Output formatted in standard UTC string to prevent client parsing discrepancies
        bookableSlots.push(slotStartUTC.toISOString());
      }

      currentSlotStart = currentSlotStart.add(intervalDelta, 'minute');
    }
  }

  return bookableSlots;
}
