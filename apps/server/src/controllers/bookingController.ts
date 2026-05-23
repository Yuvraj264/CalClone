import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/bookingService';
import { Booking } from '../models/Booking';
import { AuthenticatedRequest } from '../middlewares/authGuard';
import { AppError } from '../utils/AppError';

export class BookingController {
  /**
   * Guest scheduling endpoint to lock and reserve a slot safely.
   */
  static async book(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        eventTypeId,
        hostId,
        guestName,
        guestEmail,
        guestTimezone,
        guestNotes,
        startTime,
        endTime
      } = req.body;

      if (!eventTypeId || !hostId || !guestName || !guestEmail || !startTime || !endTime) {
        throw new AppError(400, 'BAD_REQUEST', 'Missing booking attributes: eventTypeId, hostId, guestName, guestEmail, startTime, and endTime are required.');
      }

      // Securely create slot booking checking conflicts & distributed locking
      const booking = await BookingService.bookSlot({
        eventTypeId,
        hostId,
        guestName,
        guestEmail,
        guestTimezone: guestTimezone || 'UTC',
        guestNotes,
        startTime,
        endTime
      });

      res.status(201).json({
        success: true,
        data: { booking }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves active bookings hosted by authenticated profile.
   */
  static async getHostBookings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Session context missing.');
      }

      const status = req.query.status as string;
      const queryFilter: any = { hostId: req.user.id };

      if (status === 'upcoming') {
        queryFilter.startTime = { $gte: new Date() };
        queryFilter.status = 'confirmed';
      } else if (status === 'past') {
        queryFilter.startTime = { $lt: new Date() };
        queryFilter.status = 'confirmed';
      } else if (status === 'cancelled') {
        queryFilter.status = 'cancelled';
      }

      const bookings = await Booking.find(queryFilter)
        .populate('eventTypeId', 'title duration locationType')
        .sort({ startTime: status === 'past' ? -1 : 1 });

      res.status(200).json({
        success: true,
        data: { bookings }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancels a scheduled booking.
   */
  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const booking = await BookingService.cancelBooking(id, reason || 'Cancelled by visitor.');

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully.',
        data: { booking }
      });
    } catch (error) {
      next(error);
    }
  }
}
