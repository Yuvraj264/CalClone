import dayjs from 'dayjs';
import { Types } from 'mongoose';
import { AutomationService } from './automation.service';
import { BookingModel, EventTypeModel, AvailabilityModel, UserModel } from '../models';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../constants/http';
import { CreateBookingPayload } from '@calclone/types';
import { SlotService } from './slot.service';
import { BOOKING_STATUSES } from '../constants/bookingStatuses';
import { GoogleCalendarService } from './googleCalendar.service';
import { EmailService } from './email.service';

export class BookingService {
  /**
   * Fetch all bookings with event type details populated, sorted upcoming first.
   */
  static async getAllBookings() {
    return await BookingModel.find()
      .populate({
        path: 'eventTypeId',
        select: 'title slug duration timezone',
      })
      .sort({ startTime: 1 }); // Chronological order: upcoming bookings first
  }

  /**
   * Fetch a single booking by ID.
   */
  static async getBookingById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'INVALID_ID', 'Provided booking ID format is invalid.');
    }

    const booking = await BookingModel.findById(id).populate({
      path: 'eventTypeId',
      select: 'title slug duration timezone',
    });

    if (!booking) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'BOOKING_NOT_FOUND', 'The requested booking does not exist.');
    }

    return booking;
  }

  /**
   * Create new guest booking appointment.
   */
  static async createBooking(payload: CreateBookingPayload) {
    // 1. Fetch event type configuration using slug
    const eventType = await EventTypeModel.findOne({ slug: payload.eventTypeSlug.toLowerCase(), isActive: true });
    if (!eventType) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        'EVENT_NOT_FOUND',
        'The requested event template does not exist or is inactive.'
      );
    }

    // 2. Fetch Host Availability configuration
    const availability = await AvailabilityModel.findOne({ userId: eventType.userId });
    if (!availability) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        'AVAILABILITY_NOT_FOUND',
        'Host availability schedules are not configured yet.'
      );
    }

    // Fetch Host profile to align timezone resolution
    const hostUser = await UserModel.findById(eventType.userId);

    // 3. Leverage the Slot Engine (Phase 7) to get bookable slots for the target date
    const slotResults = await SlotService.getAvailableSlots(eventType.slug, payload.date);
    
    // 4. Verify if requested slot startTime is present in generated bookable slots
    const tz = availability.timezone || hostUser?.timezone || eventType.timezone || 'UTC';
    const requestedSlotISO = dayjs.tz(`${payload.date}T${payload.startTime}:00`, tz).toISOString();

    if (!slotResults.slots.includes(requestedSlotISO)) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        'SLOT_UNAVAILABLE',
        `The requested slot time '${payload.startTime}' is not available for booking on ${payload.date}.`
      );
    }

    // 5. Enforce dynamic timezone calculations
    const startDateTime = dayjs.tz(`${payload.date}T${payload.startTime}:00`, tz);
    const endDateTime = startDateTime.add(eventType.duration, 'minute');

    const startUTC = startDateTime.toDate();
    const endUTC = endDateTime.toDate();

    // 6. Hard double booking prevention at application layer
    const doubleBooked = await BookingModel.exists({
      hostId: eventType.userId,
      status: BOOKING_STATUSES.SCHEDULED,
      startTime: startUTC,
    });

    if (doubleBooked) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        'DOUBLE_BOOKING',
        'The requested calendar slot is already booked by another scheduled meeting.'
      );
    }

    // 7. Insert and return Mongoose record
    const booking = new BookingModel({
      eventTypeId: eventType._id,
      hostId: eventType.userId,
      guestName: payload.bookerName,
      guestEmail: payload.bookerEmail,
      guestTimezone: tz,
      bookerName: payload.bookerName,
      bookerEmail: payload.bookerEmail,
      startTime: startUTC,
      endTime: endUTC,
      status: BOOKING_STATUSES.SCHEDULED,
    });

    await booking.save();

    // 8. Attempt Google Calendar Event Synchronization
    try {
      const calendarSync = await GoogleCalendarService.createEvent(
        eventType.userId.toString(),
        booking,
        eventType
      );

      if (calendarSync.googleEventId) {
        booking.googleEventId = calendarSync.googleEventId;
        booking.googleMeetLink = calendarSync.googleMeetLink || '';
        await booking.save();
      }
    } catch (googleError) {
      console.error('[Booking Service Google Sync Failure]: Non-fatal skipped.', googleError);
    }

    // 9. Dispatch Booking Confirmation Email
    try {
      const host = await UserModel.findById(eventType.userId);
      if (host) {
        await EmailService.sendBookingConfirmation(booking, eventType, host);
      }
    } catch (emailError) {
      console.error('[Booking Service Email Confirmation Failure]: Non-fatal skipped.', emailError);
    }

    return booking;
  }

  static async cancelBooking(
    id: string,
    payload?: { reason?: string; feedback?: string; source?: 'host' | 'attendee' }
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'INVALID_ID', 'Provided booking ID format is invalid.');
    }

    const booking = await BookingModel.findById(id);
    if (!booking) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'BOOKING_NOT_FOUND', 'The requested booking does not exist.');
    }

    const originalGoogleEventId = booking.googleEventId;

    booking.status = 'cancelled';
    if (payload) {
      booking.cancellationReason = payload.reason || '';
      booking.cancellationFeedback = payload.feedback || '';
      booking.cancellationSource = payload.source || 'attendee';
    }

    booking.auditLogs = booking.auditLogs || [];
    booking.auditLogs.push({
      action: 'cancelled',
      timestamp: new Date(),
      details: `Meeting cancelled by ${payload?.source || 'attendee'}. Reason: ${payload?.reason || 'None'}.`
    });

    await booking.save();

    // Clean up Google Calendar if integrated
    if (originalGoogleEventId) {
      try {
        await GoogleCalendarService.deleteEvent(booking.hostId.toString(), originalGoogleEventId);
      } catch (googleError) {
        console.error('[Booking Cancel Google Event Cleanup Fail]:', googleError);
      }
    }

    // Dispatch Cancellation Email Notification
    try {
      const host = await UserModel.findById(booking.hostId);
      const eventType = await EventTypeModel.findById(booking.eventTypeId);
      if (host && eventType) {
        await EmailService.sendBookingCancellation(booking, eventType, host);
        await AutomationService.triggerWorkflow('cancelled', booking, {
          eventTitle: eventType.title,
          hostName: host.fullName
        });
      }
    } catch (emailError) {
      console.error('[Booking Service Email Cancellation Failure]: Non-fatal skipped.', emailError);
    }

    return booking;
  }

  static async undoCancelBooking(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'INVALID_ID', 'Provided booking ID format is invalid.');
    }

    const booking = await BookingModel.findById(id);
    if (!booking) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'BOOKING_NOT_FOUND', 'The requested booking does not exist.');
    }

    if (booking.status !== 'cancelled') {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'NOT_CANCELLED', 'This booking is not currently cancelled.');
    }

    // Double-booking check to ensure the slot hasn't been claimed in the meantime
    const doubleBooked = await BookingModel.exists({
      hostId: booking.hostId,
      status: { $in: ['scheduled', 'confirmed'] },
      startTime: booking.startTime,
    });

    if (doubleBooked) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        'DOUBLE_BOOKING',
        'Cannot undo cancellation: this calendar slot is already booked by another scheduled meeting.'
      );
    }

    booking.status = 'scheduled';
    booking.cancellationReason = '';
    booking.cancellationSource = undefined;
    booking.cancellationFeedback = '';
    
    booking.auditLogs = booking.auditLogs || [];
    booking.auditLogs.push({
      action: 'undo_cancellation',
      timestamp: new Date(),
      details: 'Host undid the booking cancellation; status restored to scheduled.'
    });

    await booking.save();

    // Re-create Google Calendar event if integrated
    const eventType = await EventTypeModel.findById(booking.eventTypeId);
    if (eventType) {
      try {
        const calendarSync = await GoogleCalendarService.createEvent(
          booking.hostId.toString(),
          booking,
          eventType
        );

        if (calendarSync.googleEventId) {
          booking.googleEventId = calendarSync.googleEventId;
          booking.googleMeetLink = calendarSync.googleMeetLink || '';
          await booking.save();
        }
      } catch (googleError) {
        console.error('[Booking Undo Cancel Google Sync Failure]:', googleError);
      }
    }

    return booking;
  }

  static async addInternalNote(id: string, text: string, author: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'INVALID_ID', 'Provided booking ID format is invalid.');
    }

    const booking = await BookingModel.findById(id);
    if (!booking) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'BOOKING_NOT_FOUND', 'The requested booking does not exist.');
    }

    const note = {
      id: new Types.ObjectId().toString(),
      text,
      createdAt: new Date(),
      author,
    };

    booking.internalNotes = booking.internalNotes || [];
    booking.internalNotes.push(note);
    
    booking.auditLogs = booking.auditLogs || [];
    booking.auditLogs.push({
      action: 'add_note',
      timestamp: new Date(),
      details: `Added internal note by ${author}.`
    });

    await booking.save();
    return booking;
  }

  static async deleteInternalNote(id: string, noteId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'INVALID_ID', 'Provided booking ID format is invalid.');
    }

    const booking = await BookingModel.findById(id);
    if (!booking) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'BOOKING_NOT_FOUND', 'The requested booking does not exist.');
    }

    booking.internalNotes = booking.internalNotes?.filter((n) => n.id !== noteId) || [];

    booking.auditLogs = booking.auditLogs || [];
    booking.auditLogs.push({
      action: 'delete_note',
      timestamp: new Date(),
      details: `Deleted internal note with ID: ${noteId}.`
    });

    await booking.save();
    return booking;
  }

  static async reschedule(id: string, payload: { date: string; startTime: string }) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'INVALID_ID', 'Provided booking ID format is invalid.');
    }

    const booking = await BookingModel.findById(id);
    if (!booking) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'BOOKING_NOT_FOUND', 'The requested booking does not exist.');
    }

    const eventType = await EventTypeModel.findById(booking.eventTypeId);
    if (!eventType) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'EVENT_NOT_FOUND', 'Linked event template was not found.');
    }

    const availability = await AvailabilityModel.findOne({ userId: eventType.userId });
    if (!availability) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'AVAILABILITY_NOT_FOUND', 'Host availability schedules are not configured.');
    }

    const hostUser = await UserModel.findById(eventType.userId);

    // 1. Verify slot is available on target date
    const slotResults = await SlotService.getAvailableSlots(eventType.slug, payload.date);
    const tz = availability.timezone || hostUser?.timezone || eventType.timezone || 'UTC';
    const requestedSlotISO = dayjs.tz(`${payload.date}T${payload.startTime}:00`, tz).toISOString();

    if (!slotResults.slots.includes(requestedSlotISO)) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        'SLOT_UNAVAILABLE',
        `The requested slot time '${payload.startTime}' is not available for booking on ${payload.date}.`
      );
    }

    // 2. Perform timezone recalculations
    const startDateTime = dayjs.tz(`${payload.date}T${payload.startTime}:00`, tz);
    const endDateTime = startDateTime.add(eventType.duration, 'minute');

    const startUTC = startDateTime.toDate();
    const endUTC = endDateTime.toDate();

    // 3. Double-booking check
    const doubleBooked = await BookingModel.exists({
      hostId: eventType.userId,
      _id: { $ne: booking._id },
      status: BOOKING_STATUSES.SCHEDULED,
      startTime: startUTC,
    });

    if (doubleBooked) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        'DOUBLE_BOOKING',
        'The requested calendar slot is already booked.'
      );
    }

    // Capture old time for email dispatch
    const oldTime = booking.startTime;
    const oldGoogleEventId = booking.googleEventId;

    // 4. Update Mongoose record
    booking.startTime = startUTC;
    booking.endTime = endUTC;
    booking.status = BOOKING_STATUSES.SCHEDULED; // reset status on reschedule
    await booking.save();

    // 5. Update external Google Calendar event
    if (oldGoogleEventId) {
      try {
        await GoogleCalendarService.deleteEvent(booking.hostId.toString(), oldGoogleEventId);
      } catch (googleError) {
        console.error('[Booking Reschedule Google Event Delete Error]:', googleError);
      }
    }

    try {
      const calendarSync = await GoogleCalendarService.createEvent(
        eventType.userId.toString(),
        booking,
        eventType
      );

      if (calendarSync.googleEventId) {
        booking.googleEventId = calendarSync.googleEventId;
        booking.googleMeetLink = calendarSync.googleMeetLink || '';
        await booking.save();
      }
    } catch (googleError) {
      console.error('[Booking Reschedule Google Sync Failure]: Non-fatal skipped.', googleError);
    }

    // 6. Dispatch Reschedule Email Notifications
    try {
      const host = await UserModel.findById(booking.hostId);
      if (host) {
        await EmailService.sendBookingRescheduled(booking, eventType, host, oldTime);
      }
    } catch (emailError) {
      console.error('[Booking Reschedule Email Dispatch Error]: Non-fatal skipped.', emailError);
    }

    return booking;
  }
}
