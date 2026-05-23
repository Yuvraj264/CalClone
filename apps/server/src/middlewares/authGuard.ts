import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export const authGuard = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log(`[authGuard Debug] Method: ${req.method} URL: ${req.originalUrl || req.url}`);
    console.log('[authGuard Debug] Auth Header:', req.headers.authorization);
    console.log('[authGuard Debug] Cookies Header:', req.headers.cookie);

    // 1. Resolve token from authorization header or secure cookies
    let token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;

    if (!token && req.headers.cookie) {
      // Manual cookie parsing (or cookie-parser if registered)
      const cookieHeader = req.headers.cookie;
      const parsedCookies = Object.fromEntries(
        cookieHeader.split(';').map(c => c.trim().split('='))
      );
      token = parsedCookies['token'];
    }

    if (!token) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication token missing. Please sign in.');
    }

    // 2. Verify token signature
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development';
    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      email: string;
      username: string;
    };

    // 3. Attach session identity to request stream
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError(401, 'INVALID_TOKEN', 'Session token is invalid. Please login again.'));
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError(401, 'TOKEN_EXPIRED', 'Session token has expired. Please login again.'));
    } else {
      next(error);
    }
  }
};
