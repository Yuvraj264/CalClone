import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest } from '../middlewares/authGuard';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, username, fullName } = req.body;
      if (!email || !password || !username || !fullName) {
        throw new AppError(400, 'BAD_REQUEST', 'Missing registration attributes: email, password, username, fullName are required.');
      }

      const { user, token } = await AuthService.registerUser({ email, password, username, fullName });

      // Set HttpOnly secure token cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            timezone: user.timezone
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError(400, 'BAD_REQUEST', 'Missing login attributes: email and password are required.');
      }

      const { user, token } = await AuthService.loginUser({ email, password });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            timezone: user.timezone
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('token');
      res.status(200).json({
        success: true,
        message: 'Successfully logged out and session cleared.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Session context missing.');
      }

      const user = await User.findById(req.user.id).select('-passwordHash');
      if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'User profile was not found.');
      }

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  static async oauthSync(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name, image, googleId, googleAccessToken, googleRefreshToken, googleTokenExpiry } = req.body;
      if (!email || !name || !googleId) {
        throw new AppError(400, 'BAD_REQUEST', 'Missing OAuth sync attributes: email, name, and googleId are required.');
      }

      const { user, token } = await AuthService.oauthSyncUser({
        email,
        name,
        image,
        googleId,
        googleAccessToken,
        googleRefreshToken,
        googleTokenExpiry: googleTokenExpiry ? new Date(googleTokenExpiry) : undefined,
      });

      // Set HttpOnly secure token cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            timezone: user.timezone
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, redirectUri } = req.body;
      if (!code || !redirectUri) {
        throw new AppError(400, 'BAD_REQUEST', 'Missing attributes: authorization code and redirectUri are required.');
      }

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }).toString(),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('[Google Token Exchange Failed]:', errorText);
        throw new AppError(400, 'GOOGLE_AUTH_FAILED', 'Failed to exchange authorization code with Google.');
      }

      const tokenData = await tokenResponse.json() as any;
      const { access_token, refresh_token, expires_in } = tokenData;

      const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new AppError(400, 'GOOGLE_AUTH_FAILED', 'Failed to retrieve user profile from Google.');
      }

      const userData = await userResponse.json() as any;
      const { email, name, picture, sub: googleId } = userData;

      const { user, token } = await AuthService.oauthSyncUser({
        email,
        name,
        image: picture,
        googleId,
        googleAccessToken: access_token,
        googleRefreshToken: refresh_token,
        googleTokenExpiry: expires_in ? new Date(Date.now() + expires_in * 1000) : undefined,
      });

      // Set HttpOnly secure token cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            timezone: user.timezone,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
