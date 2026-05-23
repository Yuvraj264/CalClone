import { Types } from 'mongoose';
import { AvailabilityModel, UserModel } from '../models';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../constants/http';
import { CreateAvailabilityPayload, UpdateAvailabilityPayload } from '@calclone/types';
import { WEEKDAYS_MAP, Weekday } from '../constants/weekdays';

export class AvailabilityService {
  /**
   * Maps dayOfWeek string representation to number (0-6).
   */
  private static parseDayOfWeek(day: any): number | undefined {
    if (day === undefined || day === null) return undefined;
    if (typeof day === 'number') return day;
    
    const parsed = WEEKDAYS_MAP[day.toLowerCase() as Weekday];
    if (parsed === undefined) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'INVALID_WEEKDAY', `Invalid weekday string: ${day}`);
    }
    return parsed;
  }

  /**
   * Retrieve all availabilities sorted by weekday order.
   */
  static async getAllAvailabilities(userId?: string) {
    const filter = userId ? { userId: new Types.ObjectId(userId) } : {};
    return await AvailabilityModel.find(filter)
      .sort({ dayOfWeek: 1 })
      .populate('userId', 'name email username');
  }

  /**
   * Retrieve a single availability by ID.
   */
  static async getAvailabilityById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'INVALID_ID', 'Provided availability ID format is invalid.');
    }

    const availability = await AvailabilityModel.findById(id).populate('userId', 'name email username');

    if (!availability) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'AVAILABILITY_NOT_FOUND', 'The requested availability record does not exist.');
    }

    return availability;
  }

  /**
   * Create new availability mapping.
   */
  static async createAvailability(payload: CreateAvailabilityPayload) {
    let targetUserId = payload.userId;

    // 1. Verify user profile exists
    if (!targetUserId) {
      const fallbackUser = await UserModel.findOne();
      if (!fallbackUser) {
        throw new AppError(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          'NO_USER_FOUND',
          'No user profiles exist to attach the availability.'
        );
      }
      targetUserId = fallbackUser._id.toString();
    } else {
      if (!Types.ObjectId.isValid(targetUserId)) {
        throw new AppError(HTTP_STATUS.BAD_REQUEST, 'INVALID_ID', 'Attached user ID format is invalid.');
      }
      const userExists = await UserModel.exists({ _id: targetUserId });
      if (!userExists) {
        throw new AppError(HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND', 'Attached user profile was not found.');
      }
    }

    // 2. Validate one-to-one constraint
    const existing = await AvailabilityModel.findOne({ userId: new Types.ObjectId(targetUserId) });
    if (existing) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        'AVAILABILITY_EXISTS',
        'An availability configuration already exists for this user profile.'
      );
    }

    // 3. Map dayOfWeek if present
    const dayNum = this.parseDayOfWeek(payload.dayOfWeek);

    // 4. Initialize Mongoose document
    const availability = new AvailabilityModel({
      userId: new Types.ObjectId(targetUserId),
      dayOfWeek: dayNum,
      startTime: payload.startTime,
      endTime: payload.endTime,
      timezone: payload.timezone || 'UTC',
      weeklySlots: payload.weeklySlots || [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', active: true },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', active: true },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', active: true },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', active: true },
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', active: true },
      ],
      dateOverrides: payload.dateOverrides || [],
    });

    await availability.save();
    return availability;
  }

  /**
   * Update existing availability schedule.
   */
  static async updateAvailability(id: string, payload: UpdateAvailabilityPayload) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'INVALID_ID', 'Provided availability ID format is invalid.');
    }

    // 1. Verify existence
    const availability = await AvailabilityModel.findById(id);
    if (!availability) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'AVAILABILITY_NOT_FOUND', 'The requested availability record does not exist.');
    }

    // 2. Parse dayOfWeek if provided
    if (payload.dayOfWeek !== undefined) {
      availability.dayOfWeek = this.parseDayOfWeek(payload.dayOfWeek);
    }

    // 3. Update parameters
    if (payload.startTime !== undefined) availability.startTime = payload.startTime;
    if (payload.endTime !== undefined) availability.endTime = payload.endTime;
    if (payload.timezone !== undefined) availability.timezone = payload.timezone;
    if (payload.weeklySlots !== undefined) availability.weeklySlots = payload.weeklySlots;
    if (payload.dateOverrides !== undefined) availability.dateOverrides = payload.dateOverrides;

    await availability.save();
    return availability;
  }

  /**
   * Delete availability matrix.
   */
  static async deleteAvailability(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'INVALID_ID', 'Provided availability ID format is invalid.');
    }

    const availability = await AvailabilityModel.findById(id);
    if (!availability) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'AVAILABILITY_NOT_FOUND', 'The requested availability record does not exist.');
    }

    await AvailabilityModel.deleteOne({ _id: availability._id });
    return availability;
  }
}
