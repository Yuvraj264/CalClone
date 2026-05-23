import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { Availability } from '../models/Availability';
import { AppError } from '../utils/AppError';

export class AuthService {
  /**
   * Registers a new host profile and sets up default availability.
   */
  static async registerUser(payload: {
    email: string;
    password: string;
    username: string;
    fullName: string;
  }): Promise<{ user: IUser; token: string }> {
    const { email, password, username, fullName } = payload;

    // 1. Verify uniqueness of email and username
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new AppError(400, 'EMAIL_EXISTS', 'Email address is already registered.');
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new AppError(400, 'USERNAME_TAKEN', 'Username workspace slug is already claimed.');
    }

    // 2. Hash raw password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Create User record
    const user = new User({
      email,
      username,
      fullName,
      passwordHash,
      timezone: 'UTC'
    });
    await user.save();

    // 4. Initialize Default Availability rules (Monday to Friday, 9:00 to 17:00 UTC)
    const defaultWeeklySlots = Array.from({ length: 5 }, (_, i) => ({
      dayOfWeek: i + 1, // Mon (1) - Fri (5)
      startTime: '09:00',
      endTime: '17:00',
      active: true
    }));

    const availability = new Availability({
      userId: user._id,
      timezone: 'UTC',
      weeklySlots: defaultWeeklySlots,
      dateOverrides: []
    });
    await availability.save();

    // 5. Generate secure JWT token payload
    const token = this.generateToken(user);
    return { user, token };
  }

  /**
   * Authenticates user email/password.
   */
  static async loginUser(payload: {
    email: string;
    password: string;
  }): Promise<{ user: IUser; token: string }> {
    const { email, password } = payload;

    // 1. Retrieve user credentials
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password credentials.');
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password credentials.');
    }

    // 3. Generate token
    const token = this.generateToken(user);
    return { user, token };
  }

  private static generateToken(user: IUser): string {
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_development';
    return jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      secret,
      { expiresIn: '7d' }
    );
  }

  /**
   * Synchronizes an OAuth user with MongoDB. Creates user and default Availability if they don't exist yet.
   */
  static async oauthSyncUser(payload: {
    email: string;
    name: string;
    image?: string;
    googleId: string;
    googleAccessToken?: string;
    googleRefreshToken?: string;
    googleTokenExpiry?: Date;
  }): Promise<{ user: IUser; token: string }> {
    const { email, name, image, googleId, googleAccessToken, googleRefreshToken, googleTokenExpiry } = payload;

    // 1. Verify if user already exists in MongoDB
    let user = await User.findOne({ email });

    if (!user) {
      // 2. Generate a clean unique username slug from email (e.g. "carol.guest" from "carol.guest@dev.com")
      const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '');
      let baseUsername = emailPrefix || 'user';
      let username = baseUsername;
      
      // Ensure username uniqueness by appending suffix if already in use
      let counter = 1;
      while (await User.exists({ username })) {
        username = `${baseUsername}-${counter}`;
        counter++;
      }

      // 3. Hash a dummy password for model compliance
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(`google-oauth-placeholder-${googleId}`, salt);

      // 4. Create new User document
      user = new User({
        name,
        fullName: name,
        username,
        email,
        passwordHash,
        avatarUrl: image || '',
        timezone: 'UTC',
        googleAccessToken: googleAccessToken || '',
        googleRefreshToken: googleRefreshToken || '',
        googleTokenExpiry,
      });
      await user.save();

      // 5. Initialize default Availability matrix
      const defaultWeeklySlots = Array.from({ length: 5 }, (_, i) => ({
        dayOfWeek: i + 1, // Mon (1) - Fri (5)
        startTime: '09:00',
        endTime: '17:00',
        active: true,
      }));

      const availability = new Availability({
        userId: user._id,
        timezone: 'UTC',
        weeklySlots: defaultWeeklySlots,
        dateOverrides: [],
      });
      await availability.save();
    } else {
      // If user exists, optionally sync their profile image and update Google tokens
      let userUpdated = false;
      if (image && user.avatarUrl !== image) {
        user.avatarUrl = image;
        userUpdated = true;
      }
      if (googleAccessToken && user.googleAccessToken !== googleAccessToken) {
        user.googleAccessToken = googleAccessToken;
        userUpdated = true;
      }
      if (googleRefreshToken && user.googleRefreshToken !== googleRefreshToken) {
        user.googleRefreshToken = googleRefreshToken;
        userUpdated = true;
      }
      if (googleTokenExpiry && (!user.googleTokenExpiry || user.googleTokenExpiry.getTime() !== googleTokenExpiry.getTime())) {
        user.googleTokenExpiry = googleTokenExpiry;
        userUpdated = true;
      }

      if (userUpdated) {
        await user.save();
      }
    }

    // 6. Generate backend JWT token
    const token = this.generateToken(user);
    return { user, token };
  }
}
