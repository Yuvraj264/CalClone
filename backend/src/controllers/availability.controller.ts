import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/apiResponse';
import { AvailabilityService } from '../services/availability.service';
import { HTTP_STATUS } from '../constants/http';

export const getAllAvailabilities = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const availabilities = await AvailabilityService.getAllAvailabilities(userId);
  return successResponse(res, HTTP_STATUS.OK, availabilities, 'Availabilities retrieved successfully.');
});

export const getAvailabilityById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const availability = await AvailabilityService.getAvailabilityById(id);
  return successResponse(res, HTTP_STATUS.OK, availability, 'Availability retrieved successfully.');
});

export const createAvailability = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body;

  if ((req as any).user?.id) {
    payload.userId = (req as any).user.id;
  }

  const newAvailability = await AvailabilityService.createAvailability(payload);
  return successResponse(res, HTTP_STATUS.CREATED, newAvailability, 'Availability schedule registered successfully.');
});

export const updateAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const updatedAvailability = await AvailabilityService.updateAvailability(id, payload);
  return successResponse(res, HTTP_STATUS.OK, updatedAvailability, 'Availability schedule updated successfully.');
});

export const deleteAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedAvailability = await AvailabilityService.deleteAvailability(id);
  return successResponse(res, HTTP_STATUS.OK, deletedAvailability, 'Availability schedule deleted successfully.');
});
