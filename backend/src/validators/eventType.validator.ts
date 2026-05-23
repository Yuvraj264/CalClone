import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../constants/http';

export const validateCreateEventType = (req: Request, res: Response, next: NextFunction): void => {
  const { title, duration, slug, timezone } = req.body;
  const errors: string[] = [];

  if (!title || typeof title !== 'string' || title.trim().length < 2 || title.trim().length > 100) {
    errors.push('Title is required and must be between 2 and 100 characters.');
  }

  if (duration === undefined || typeof duration !== 'number' || duration <= 0 || !Number.isInteger(duration)) {
    errors.push('Duration must be a positive integer in minutes.');
  }

  if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
    errors.push('Slug is required and must contain only lowercase alphanumeric characters and hyphens.');
  }

  if (!timezone || typeof timezone !== 'string' || timezone.trim().length === 0) {
    errors.push('Timezone is required.');
  }

  if (errors.length > 0) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'VALIDATION_FAILED', errors.join('; '));
  }

  next();
};

export const validateUpdateEventType = (req: Request, res: Response, next: NextFunction): void => {
  const { title, duration, slug, timezone } = req.body;
  const errors: string[] = [];

  if (title !== undefined && (typeof title !== 'string' || title.trim().length < 2 || title.trim().length > 100)) {
    errors.push('Title must be between 2 and 100 characters.');
  }

  if (duration !== undefined && (typeof duration !== 'number' || duration <= 0 || !Number.isInteger(duration))) {
    errors.push('Duration must be a positive integer in minutes.');
  }

  if (slug !== undefined && (typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug))) {
    errors.push('Slug must contain only lowercase alphanumeric characters and hyphens.');
  }

  if (timezone !== undefined && (typeof timezone !== 'string' || timezone.trim().length === 0)) {
    errors.push('Timezone must be a valid string.');
  }

  if (errors.length > 0) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'VALIDATION_FAILED', errors.join('; '));
  }

  next();
};
