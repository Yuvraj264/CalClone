import { Router } from 'express';
import { BookingController } from '../controllers/bookingController';
import { authGuard } from '../middlewares/authGuard';
import {
  getAnalytics,
  getBookingById,
  createBooking,
  cancelBooking,
  rescheduleBooking
} from '../controllers/booking.controller';

const router = Router();

// Public routes (used by guest booking page)
router.post('/public/book', BookingController.book);
router.post('/:id/cancel/public', BookingController.cancel);

// Protected host administration routes
router.get('/analytics', authGuard, getAnalytics);

// Protected/Public CRUD operations
router.get('/', authGuard, BookingController.getHostBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.patch('/:id/cancel', cancelBooking);
router.patch('/:id/reschedule', rescheduleBooking);
router.post('/:id/cancel', authGuard, BookingController.cancel);

export default router;
