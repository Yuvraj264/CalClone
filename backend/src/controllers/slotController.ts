import { Request, Response, NextFunction } from 'express';
import dayjs from 'dayjs';
import { User } from '../models/User';
import { Availability } from '../models/Availability';
import { Booking } from '../models/Booking';
import { EventType } from '../models/EventType';
import { generateSlots } from '../services/slotGenerator';
import { AppError } from '../utils/AppError';

export class SlotController {
  /**
   * Retrieves bookable, open slots for a specific host date, timezone, and event duration constraints.
   */
  static async getAvailableSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, eventSlug, date, timezone } = req.query as {
        username: string;
        eventSlug: string;
        date: string;
        timezone: string;
      };

      if (!username || !eventSlug || !date) {
        throw new AppError(400, 'BAD_REQUEST', 'Missing slot check parameters: username, eventSlug, and date are required.');
      }

      // 1. Locate Host User Context
      const host = await User.findOne({ username: username.toLowerCase() });
      if (!host) {
        throw new AppError(404, 'HOST_NOT_FOUND', 'Host schedule profile was not found.');
      }

      // 2. Fetch Event Settings
      const eventType = await EventType.findOne({ userId: host._id, slug: eventSlug.toLowerCase(), isActive: true });
      if (!eventType) {
        throw new AppError(404, 'EVENT_NOT_FOUND', 'The requested booking event template is not available.');
      }

      // 3. Retrieve Availability Configuration rules
      const availability = await Availability.findOne({ userId: host._id });
      if (!availability) {
        throw new AppError(404, 'AVAILABILITY_NOT_FOUND', 'Host availability schedules are not configured.');
      }

      // 4. Fetch confirmed bookings for target day (UTC range check)
      const targetStart = dayjs(date).startOf('day').toDate();
      const targetEnd = dayjs(date).endOf('day').toDate();

      const existingBookings = await Booking.find({
        hostId: host._id,
        status: 'confirmed',
        startTime: { $gte: targetStart, $lte: targetEnd }
      }).select('startTime endTime');

      // 5. Generate bookable slot options using our scheduling engine
      const openSlots = generateSlots({
        targetDate: date,
        duration: eventType.duration,
        bufferTime: eventType.bufferTime,
        hostTimezone: availability.timezone || host.timezone || 'UTC',
        weeklySchedule: availability.weeklySlots,
        dateOverrides: availability.dateOverrides,
        existingBookings: existingBookings.map((b: any) => ({
          startTime: b.startTime,
          endTime: b.endTime
        }))
      });

      res.status(200).json({
        success: true,
        data: {
          date,
          slots: openSlots
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
