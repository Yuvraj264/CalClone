import dayjs from 'dayjs';
import { Types } from 'mongoose';
import { EventTypeModel, AvailabilityModel, BookingModel, UserModel } from '../models';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../constants/http';
import { isValidISODate } from '../utils/dateTime';
import { generateSlots } from './slotGenerator';
import { GoogleCalendarService } from './googleCalendar.service';

export class SlotService {
  /**
   * Evaluates and returns open scheduling slots for a given slug template and target date.
   */
  static async getAvailableSlots(slug: string, dateStr: string) {
    // 1. Validate date query parameter
    if (!dateStr || !isValidISODate(dateStr)) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'INVALID_DATE', 'A valid ISO date parameter is required.');
    }

    // 2. Fetch the target Event Type template
    const eventType = await EventTypeModel.findOne({ slug: slug.toLowerCase(), isActive: true });
    if (!eventType) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'EVENT_NOT_FOUND', 'The requested event template slug does not exist or is inactive.');
    }

    // 3. Locate user profile linked to the event type
    const hostUser = await UserModel.findById(eventType.userId);
    if (!hostUser) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'HOST_NOT_FOUND', 'The host user linked to this event was not found.');
    }

    // 4. Fetch host availability schedule rules
    const availability = await AvailabilityModel.findOne({ userId: eventType.userId });
    if (!availability) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'AVAILABILITY_NOT_FOUND', 'Host availability rules are not configured yet.');
    }

    // 5. Check if the target day is working or blocked via overrides
    const targetDayOfWeek = dayjs(dateStr).day();
    
    // Check custom overrides first
    const override = availability.dateOverrides.find((o) => o.date === dateStr);
    let workingStart = '';
    let workingEnd = '';
    let isBlocked = false;

    if (override) {
      if (override.blocked) {
        isBlocked = true;
      } else {
        workingStart = override.startTime;
        workingEnd = override.endTime;
      }
    } else {
      // Fallback to weekly schedule slots
      const weeklySlot = availability.weeklySlots.find((s) => s.dayOfWeek === targetDayOfWeek && s.active);
      if (!weeklySlot) {
        isBlocked = true;
      } else {
        workingStart = weeklySlot.startTime;
        workingEnd = weeklySlot.endTime;
      }
    }

    if (isBlocked || !workingStart || !workingEnd) {
      return {
        date: dateStr,
        slots: [],
      };
    }

    // 6. Fetch Google Calendar busy slots from external sync
    const googleBusySlots = await GoogleCalendarService.fetchBusySlots(
      eventType.userId.toString(),
      dateStr,
      availability.timezone || hostUser.timezone || 'UTC'
    );

    // 7. Fetch existing MERN guest bookings (status = 'scheduled' or 'confirmed')
    const targetStart = dayjs(dateStr).startOf('day').toDate();
    const targetEnd = dayjs(dateStr).endOf('day').toDate();

    const mongooseBookings = await BookingModel.find({
      hostId: eventType.userId,
      status: { $in: ['scheduled', 'confirmed'] },
      startTime: { $gte: targetStart, $lte: targetEnd },
    }).select('startTime endTime');

    // 8. Merge both sets of busy intervals
    const unifiedBusyBookings = [
      ...mongooseBookings.map((b) => ({
        startTime: b.startTime,
        endTime: b.endTime,
      })),
      ...googleBusySlots,
    ];

    // 9. Generate slots using the advanced generateSlots utility which handles buffers!
    const slots = generateSlots({
      targetDate: dateStr,
      duration: eventType.duration,
      bufferTime: eventType.bufferTime || 0,
      hostTimezone: availability.timezone || hostUser.timezone || 'UTC',
      weeklySchedule: availability.weeklySlots,
      dateOverrides: availability.dateOverrides,
      existingBookings: unifiedBusyBookings,
    });

    return {
      date: dateStr,
      slots,
    };
  }
}
