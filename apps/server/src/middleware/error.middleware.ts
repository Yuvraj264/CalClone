import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { errorResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants/http';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'An unexpected internal server error occurred.';
  let errors = err.errors || undefined;

  // Resolve environment config defaults
  const isProduction = process.env.NODE_ENV === 'production';

  // Handle Mongoose Validation or Duplicate Key Errors
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation Failed';
    errors = Object.values(err.errors).map((el: any) => el.message);
  } else if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const key = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered. The field '${key}' must be unique.`;
  } else if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Invalid format for field '${err.path}': '${err.value}'.`;
  }

  // Under production, sanitize system details for non-operational failures
  if (isProduction && !(err instanceof AppError)) {
    console.error('[UNHANDLED SYSTEM ERROR]:', err);
    message = 'Something went wrong on our server. Please try again later.';
    errors = undefined;
  }

  errorResponse(
    res,
    statusCode,
    message,
    !isProduction ? { ...errors, stack: err.stack } : errors
  );
};
