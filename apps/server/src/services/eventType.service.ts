import { Types } from 'mongoose';
import { EventTypeModel, UserModel } from '../models';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../constants/http';
import { CreateEventTypePayload, UpdateEventTypePayload } from '@calclone/types';

export class EventTypeService {
  /**
   * Fetch all event types sorted by latest creation date.
   */
  static async getAllEventTypes(userId?: string) {
    const filter = userId ? { userId: new Types.ObjectId(userId) } : {};
    return await EventTypeModel.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email username');
  }

  /**
   * Fetch a single event type by MongoDB ID.
   */
  static async getEventTypeById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'INVALID_ID', 'Provided event type ID format is invalid.');
    }

    const eventType = await EventTypeModel.findById(id).populate('userId', 'name email username');

    if (!eventType) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'EVENT_NOT_FOUND', 'The requested event type does not exist.');
    }

    return eventType;
  }

  /**
   * Create a new event type.
   */
  static async createEventType(payload: CreateEventTypePayload) {
    // 1. Verify user exists if a userId is provided
    let targetUserId = payload.userId;
    if (!targetUserId) {
      // For testing/mocking fallback, query an existing user or create a static system user ref
      const fallbackUser = await UserModel.findOne();
      if (!fallbackUser) {
        throw new AppError(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          'NO_USER_FOUND',
          'No user profiles exist in the system database to attach the event type.'
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

    // 2. Verify slug uniqueness
    const slugInUse = await EventTypeModel.findOne({ slug: payload.slug });
    if (slugInUse) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        'DUPLICATE_SLUG',
        `The URL slug '${payload.slug}' is already in use by another event type.`
      );
    }

    // 3. Insert and return Mongoose record
    const eventType = new EventTypeModel({
      userId: new Types.ObjectId(targetUserId),
      title: payload.title,
      description: payload.description || '',
      duration: payload.duration,
      slug: payload.slug,
      timezone: payload.timezone,
    });

    await eventType.save();
    return eventType;
  }

  /**
   * Update an existing event type.
   */
  static async updateEventType(id: string, payload: UpdateEventTypePayload) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'INVALID_ID', 'Provided event type ID format is invalid.');
    }

    // 1. Verify existence
    const eventType = await EventTypeModel.findById(id);
    if (!eventType) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'EVENT_NOT_FOUND', 'The requested event type does not exist.');
    }

    // 2. If updating slug, verify uniqueness across other records
    if (payload.slug && payload.slug !== eventType.slug) {
      const slugInUse = await EventTypeModel.findOne({ slug: payload.slug, _id: { $ne: eventType._id } });
      if (slugInUse) {
        throw new AppError(
          HTTP_STATUS.CONFLICT,
          'DUPLICATE_SLUG',
          `The URL slug '${payload.slug}' is already in use by another event type.`
        );
      }
    }

    // 3. Update attributes
    if (payload.title !== undefined) eventType.title = payload.title;
    if (payload.description !== undefined) eventType.description = payload.description;
    if (payload.duration !== undefined) eventType.duration = payload.duration;
    if (payload.slug !== undefined) eventType.slug = payload.slug;
    if (payload.timezone !== undefined) eventType.timezone = payload.timezone;

    await eventType.save();
    return eventType;
  }

  /**
   * Delete an event type.
   */
  static async deleteEventType(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'INVALID_ID', 'Provided event type ID format is invalid.');
    }

    const eventType = await EventTypeModel.findById(id);
    if (!eventType) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'EVENT_NOT_FOUND', 'The requested event type does not exist.');
    }

    await EventTypeModel.deleteOne({ _id: eventType._id });
    return eventType;
  }

  /**
   * Retrieve a public event type by slug, populated with host details.
   */
  static async getPublicEventType(slug: string) {
    const eventType = await EventTypeModel.findOne({ slug: slug.toLowerCase(), isActive: true })
      .populate('userId', 'name email username avatarUrl bio timezone');
    
    if (!eventType) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'EVENT_NOT_FOUND', 'The requested event type template does not exist or is inactive.');
    }

    return eventType;
  }
}
