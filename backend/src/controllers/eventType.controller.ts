import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/apiResponse';
import { EventTypeService } from '../services/eventType.service';
import { HTTP_STATUS } from '../constants/http';

export const getAllEventTypes = asyncHandler(async (req: Request, res: Response) => {
  // Option to filter by user based on auth session if req.user exists
  const userId = (req as any).user?.id;
  const eventTypes = await EventTypeService.getAllEventTypes(userId);
  return successResponse(res, HTTP_STATUS.OK, eventTypes, 'Event types retrieved successfully.');
});

export const getEventTypeById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const eventType = await EventTypeService.getEventTypeById(id);
  return successResponse(res, HTTP_STATUS.OK, eventType, 'Event type retrieved successfully.');
});

export const createEventType = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body;
  
  // Attach current authenticated user id if present in req.user
  if ((req as any).user?.id) {
    payload.userId = (req as any).user.id;
  }

  const newEventType = await EventTypeService.createEventType(payload);
  return successResponse(res, HTTP_STATUS.CREATED, newEventType, 'Event type created successfully.');
});

export const updateEventType = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const updatedEventType = await EventTypeService.updateEventType(id, payload);
  return successResponse(res, HTTP_STATUS.OK, updatedEventType, 'Event type updated successfully.');
});

export const deleteEventType = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedEventType = await EventTypeService.deleteEventType(id);
  return successResponse(res, HTTP_STATUS.OK, deletedEventType, 'Event type deleted successfully.');
});

export const getPublicEventType = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const eventType = await EventTypeService.getPublicEventType(slug);
  return successResponse(res, HTTP_STATUS.OK, eventType, 'Public event type retrieved successfully.');
});
