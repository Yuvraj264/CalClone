import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

// Centralized operational and syntax error interceptor
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  if (statusCode === 500) {
    console.error('[CRITICAL SERVER EXCEPTION]:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'Something went wrong on our end.'
    }
  });
};
