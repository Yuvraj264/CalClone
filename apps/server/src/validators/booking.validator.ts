import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../constants/http';
import { isValidTimeFormat } from '../utils/timeValidation';
import { isValidISODate } from '../utils/dateTime';

const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

export const validateCreateBooking = (req: Request, res: Response, next: NextFunction): void => {
  const { eventTypeSlug, bookerName, bookerEmail, date, startTime } = req.body;
  const errors: string[] = [];

  if (!eventTypeSlug || typeof eventTypeSlug !== 'string' || !/^[a-z0-9-]+$/.test(eventTypeSlug)) {
    errors.push('eventTypeSlug is required and must be a valid lowercase URL slug.');
  }

  if (!bookerName || typeof bookerName !== 'string' || bookerName.trim().length < 2 || bookerName.trim().length > 50) {
    errors.push('bookerName is required and must be between 2 and 50 characters.');
  }

  if (!bookerEmail || typeof bookerEmail !== 'string' || !emailRegex.test(bookerEmail)) {
    errors.push('bookerEmail is required and must be a valid email address.');
  }

  if (!date || !isValidISODate(date)) {
    errors.push('date is required and must be a valid ISO date string (YYYY-MM-DD).');
  }

  if (!startTime || !isValidTimeFormat(startTime)) {
    errors.push('startTime is required and must be in HH:mm format (24-hour clock).');
  }

  if (errors.length > 0) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'VALIDATION_FAILED', errors.join('; '));
  }

  next();
};
