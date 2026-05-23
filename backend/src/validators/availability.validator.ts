import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../constants/http';
import { WEEKDAYS } from '../constants/weekdays';
import { isValidTimeFormat, isValidTimeRange } from '../utils/timeValidation';

const validWeekdays = Object.values(WEEKDAYS);

export const validateCreateAvailability = (req: Request, res: Response, next: NextFunction): void => {
  const { dayOfWeek, startTime, endTime, timezone } = req.body;
  const errors: string[] = [];

  if (dayOfWeek !== undefined) {
    if (typeof dayOfWeek === 'string') {
      if (!validWeekdays.includes(dayOfWeek.toLowerCase() as any)) {
        errors.push(`dayOfWeek must be a valid weekday name: ${validWeekdays.join(', ')}`);
      }
    } else if (typeof dayOfWeek === 'number') {
      if (dayOfWeek < 0 || dayOfWeek > 6 || !Number.isInteger(dayOfWeek)) {
        errors.push('dayOfWeek must be an integer between 0 (Sunday) and 6 (Saturday).');
      }
    } else {
      errors.push('dayOfWeek must be either a string (e.g., "monday") or a number (0-6).');
    }
  }

  if (startTime !== undefined && !isValidTimeFormat(startTime)) {
    errors.push('startTime must be in HH:mm format (24-hour clock).');
  }

  if (endTime !== undefined && !isValidTimeFormat(endTime)) {
    errors.push('endTime must be in HH:mm format (24-hour clock).');
  }

  if (startTime && endTime && !isValidTimeRange(startTime, endTime)) {
    errors.push('endTime must be strictly after startTime.');
  }

  if (!timezone || typeof timezone !== 'string' || timezone.trim().length === 0) {
    errors.push('timezone is required.');
  }

  if (errors.length > 0) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'VALIDATION_FAILED', errors.join('; '));
  }

  next();
};

export const validateUpdateAvailability = (req: Request, res: Response, next: NextFunction): void => {
  const { dayOfWeek, startTime, endTime, timezone } = req.body;
  const errors: string[] = [];

  if (dayOfWeek !== undefined) {
    if (typeof dayOfWeek === 'string') {
      if (!validWeekdays.includes(dayOfWeek.toLowerCase() as any)) {
        errors.push(`dayOfWeek must be a valid weekday name: ${validWeekdays.join(', ')}`);
      }
    } else if (typeof dayOfWeek === 'number') {
      if (dayOfWeek < 0 || dayOfWeek > 6 || !Number.isInteger(dayOfWeek)) {
        errors.push('dayOfWeek must be an integer between 0 (Sunday) and 6 (Saturday).');
      }
    } else {
      errors.push('dayOfWeek must be either a string (e.g., "monday") or a number (0-6).');
    }
  }

  if (startTime !== undefined && !isValidTimeFormat(startTime)) {
    errors.push('startTime must be in HH:mm format (24-hour clock).');
  }

  if (endTime !== undefined && !isValidTimeFormat(endTime)) {
    errors.push('endTime must be in HH:mm format (24-hour clock).');
  }

  if (startTime && endTime && !isValidTimeRange(startTime, endTime)) {
    errors.push('endTime must be strictly after startTime.');
  }

  if (timezone !== undefined && (typeof timezone !== 'string' || timezone.trim().length === 0)) {
    errors.push('timezone must be a valid string.');
  }

  if (errors.length > 0) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'VALIDATION_FAILED', errors.join('; '));
  }

  next();
};
