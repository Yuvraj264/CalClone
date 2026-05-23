import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants/http';

export const getHealth = asyncHandler(async (req: Request, res: Response) => {
  return successResponse(res, HTTP_STATUS.OK, undefined, 'API is running');
});
