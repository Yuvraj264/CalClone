import { Response } from 'express';
import { ApiResponse, ErrorResponse } from '@calclone/types';
import { HttpStatusCode } from '../constants/http';

export const successResponse = <T>(
  res: Response,
  statusCode: HttpStatusCode,
  data?: T,
  message?: string
): Response => {
  const responsePayload: ApiResponse<T> = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  };
  return res.status(statusCode).json(responsePayload);
};

export const errorResponse = (
  res: Response,
  statusCode: HttpStatusCode,
  message: string,
  errors?: any
): Response => {
  const responsePayload: ErrorResponse = {
    success: false,
    message,
    ...(errors !== undefined && { errors }),
  };
  return res.status(statusCode).json(responsePayload);
};
