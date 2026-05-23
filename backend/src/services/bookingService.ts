import mongoose from 'mongoose';
import { createClient } from 'redis';
import { Booking, IBooking } from '../models/Booking';
import { AppError } from '../utils/AppError';

// Graceful Redis Connection Initialization
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
let redisClient: ReturnType<typeof createClient> | null = null;

(async () => {
  try {
    redisClient = createClient({ url: REDIS_URL });
    redisClient.on('error', (err) => console.warn('[REDIS WARNING]: Connection issue:', err.message));
    await redisClient.connect();
    console.log('Distributed Cache (Redis) connected successfully.');
  } catch (error) {
    console.warn('[REDIS EXCEPTION]: Could not initialize Redis client. Falling back to DB transactions.');
    redisClient = null;
  }
})();

export class BookingService {
  /**
   * Securely reserves an appointment, preventing concurrent overlapping double bookings.
   */
  static async bookSlot(bookingData: {
    eventTypeId: string;
    hostId: string;
    guestName: string;
    guestEmail: string;
    guestTimezone: string;
    guestNotes?: string;
    startTime: string; // UTC ISO string
    endTime: string;   // UTC ISO string
  }): Promise<IBooking> {
    const { hostId, startTime, endTime } = bookingData;
    const lockKey = `lock:booking:${hostId}:${startTime}`;
    let lockAcquired = false;

    // 1. Acquire Distributed Redis Lock if connection is active
    if (redisClient && redisClient.isOpen) {
      try {
        const result = await redisClient.set(lockKey, 'locked', {
          NX: true, // Only set if key does not exist
          PX: 10000 // 10-second TTL
        });
        if (!result) {
          throw new AppError(409, 'SLOT_HELD', 'This slot is currently being held by another booking attempt. Please try again.');
        }
        lockAcquired = true;
      } catch (err: any) {
        if (err instanceof AppError) throw err;
        console.warn('[REDIS LOCK EXCEPTION]: Failed lock acquire. Proceeding to Transaction.');
      }
    }

    // 2. Open Mongoose Session & ACID Transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const requestedStart = new Date(startTime);
      const requestedEnd = new Date(endTime);

      // 3. Query for active overlapping bookings
      const conflict = await Booking.findOne({
        hostId,
        status: 'confirmed',
        $or: [
          { startTime: { $lt: requestedEnd, $gte: requestedStart } },
          { endTime: { $gt: requestedStart, $lte: requestedEnd } }
        ]
      }).session(session);

      if (conflict) {
        throw new AppError(409, 'SLOT_BOOKED', 'The requested time slot has already been reserved.');
      }

      // 4. Create and save new booking record
      const newBooking = new Booking({
        ...bookingData,
        startTime: requestedStart,
        endTime: requestedEnd,
        status: 'confirmed'
      });

      await newBooking.save({ session });

      // Commit transaction
      await session.commitTransaction();
      return newBooking;
    } catch (error) {
      // Abort changes on failure
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
      // 5. Release lock key
      if (lockAcquired && redisClient && redisClient.isOpen) {
        try {
          await redisClient.del(lockKey);
        } catch (err) {
          console.error('[REDIS LOCK RELEASE EXCEPTION]:', err);
        }
      }
    }
  }

  /**
   * Cancels an existing booking.
   */
  static async cancelBooking(bookingId: string, reason: string): Promise<IBooking> {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new AppError(404, 'BOOKING_NOT_FOUND', 'The booking record was not found.');
    }

    if (booking.status === 'cancelled') {
      throw new AppError(400, 'ALREADY_CANCELLED', 'This booking has already been cancelled.');
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    await booking.save();
    return booking;
  }
}
