import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/apiResponse';
import { BookingService } from '../services/booking.service';
import { HTTP_STATUS } from '../constants/http';
import { BookingModel, EventTypeModel, UserModel } from '../models';
import { AppError } from '../utils/AppError';
import { generateICSString } from '../utils/calendarInvite';
import { AuthenticatedRequest } from '../middlewares/authGuard';

export const getAllBookings = asyncHandler(async (req: Request, res: Response) => {
  const bookings = await BookingService.getAllBookings();
  return successResponse(res, HTTP_STATUS.OK, bookings, 'Bookings retrieved successfully.');
});

export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const booking = await BookingService.getBookingById(id);
  return successResponse(res, HTTP_STATUS.OK, booking, 'Booking retrieved successfully.');
});

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body;
  const newBooking = await BookingService.createBooking(payload);
  return successResponse(res, HTTP_STATUS.CREATED, newBooking, 'Booking created successfully');
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason, feedback, source } = req.body;
  const cancelledBooking = await BookingService.cancelBooking(id, { reason, feedback, source });
  return successResponse(res, HTTP_STATUS.OK, cancelledBooking, 'Booking cancelled successfully');
});

export const undoCancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const restoredBooking = await BookingService.undoCancelBooking(id);
  return successResponse(res, HTTP_STATUS.OK, restoredBooking, 'Booking cancellation successfully undone');
});

export const addInternalNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { text } = req.body;
  const author = req.user?.username || req.user?.email || 'Host';
  const updatedBooking = await BookingService.addInternalNote(id, text, author);
  return successResponse(res, HTTP_STATUS.OK, updatedBooking, 'Internal note added successfully');
});

export const deleteInternalNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id, noteId } = req.params;
  const updatedBooking = await BookingService.deleteInternalNote(id, noteId);
  return successResponse(res, HTTP_STATUS.OK, updatedBooking, 'Internal note deleted successfully');
});

export const getICSInvite = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const booking = await BookingService.getBookingById(id);
  const eventType = await EventTypeModel.findById(booking.eventTypeId);
  const host = await UserModel.findById(booking.hostId);

  if (!eventType || !host) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'RESOURCE_NOT_FOUND', 'Linked event template or host was not found.');
  }

  const icsString = generateICSString(booking, eventType, host);

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="invite-${id}.ics"`);
  return res.send(icsString);
});

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const bookings = await BookingModel.find();
  const total = bookings.length;
  const completed = bookings.filter((b) => b.status === 'completed').length;
  const cancelled = bookings.filter((b) => b.status === 'cancelled').length;

  const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

  // Calculate busiest days
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekdayCounts: Record<string, number> = {};
  days.forEach((d) => (weekdayCounts[d] = 0));

  bookings.forEach((b) => {
    const dayName = days[new Date(b.startTime).getDay()];
    weekdayCounts[dayName] = (weekdayCounts[dayName] || 0) + 1;
  });

  const busiestDays = Object.entries(weekdayCounts).map(([day, count]) => ({ day, count }));

  // Calculate monthly booking trends
  const monthlyCounts: Record<string, number> = {};
  bookings.forEach((b) => {
    const monthName = new Date(b.startTime).toLocaleString('default', { month: 'short', year: '2-digit' });
    monthlyCounts[monthName] = (monthlyCounts[monthName] || 0) + 1;
  });

  const trends = Object.entries(monthlyCounts).map(([month, count]) => ({ month, count })).slice(-6);

  return successResponse(
    res,
    HTTP_STATUS.OK,
    {
      totalBookings: total,
      completedMeetings: completed,
      cancellationRate,
      busiestDays,
      trends,
    },
    'Analytics aggregated successfully.'
  );
});

export const rescheduleBooking = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, startTime } = req.body;
  const updatedBooking = await BookingService.reschedule(id, { date, startTime });
  return successResponse(res, HTTP_STATUS.OK, updatedBooking, 'Booking rescheduled successfully');
});
