import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/apiResponse';
import { SlotService } from '../services/slot.service';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../constants/http';

export const getAvailableSlots = asyncHandler(async (req: Request, res: Response) => {
  const { slug, date } = req.query as { slug?: string; date?: string };

  if (!slug || slug.trim().length === 0) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'MISSING_SLUG', 'Event type slug query parameter is required.');
  }

  if (!date || date.trim().length === 0) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'MISSING_DATE', 'Date query parameter is required.');
  }

  const data = await SlotService.getAvailableSlots(slug, date);
  return successResponse(res, HTTP_STATUS.OK, data, 'Available slots fetched successfully');
});
