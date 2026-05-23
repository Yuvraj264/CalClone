import { Router } from 'express';
import {
  getAllBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  rescheduleBooking,
  undoCancelBooking,
  addInternalNote,
  deleteInternalNote,
  getICSInvite,
  getAnalytics,
} from '../controllers/booking.controller';
import { validateCreateBooking } from '../validators/booking.validator';
import { authGuard } from '../middlewares/authGuard';

const router = Router();

// Protected analytics dashboard endpoint
router.get('/analytics', authGuard, getAnalytics);

// Public booking CRUD operations
router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.post('/', validateCreateBooking, createBooking);
router.patch('/:id/cancel', cancelBooking);
router.patch('/:id/reschedule', rescheduleBooking);
router.get('/:id/ics', getICSInvite);

// Protected host administrative commands
router.post('/:id/undo-cancel', authGuard, undoCancelBooking);
router.post('/:id/notes', authGuard, addInternalNote);
router.delete('/:id/notes/:noteId', authGuard, deleteInternalNote);

export default router;
