import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { UserModel, EventTypeModel, AvailabilityModel, BookingModel } from '../models';
import { BOOKING_STATUS } from '../constants/validation';

// Load environmental variables
dotenv.config();

const sampleUsers = [
  {
    name: 'Alice Developer',
    fullName: 'Alice Developer',
    username: 'alice',
    email: 'alice@calclone.dev',
    passwordHash: '$2a$10$tQOkyCjE07/dCeeFhN72Meb0mF1G4uK3U594xR/GfM6uG2j9B0gQy', // bcrypt for 'password'
    timezone: 'Asia/Kolkata',
  },
  {
    name: 'Bob Designer',
    fullName: 'Bob Designer',
    username: 'bob',
    email: 'bob@calclone.dev',
    passwordHash: '$2a$10$tQOkyCjE07/dCeeFhN72Meb0mF1G4uK3U594xR/GfM6uG2j9B0gQy', // bcrypt for 'password'
    timezone: 'Asia/Kolkata',
  },
];

const sampleEventTypes = (userIds: string[]) => [
  {
    userId: userIds[0],
    title: 'SDE 30m Tech Interview',
    description: 'Technical alignment and systems architecture review.',
    duration: 30,
    slug: 'tech-interview',
    timezone: 'Asia/Kolkata',
  },
  {
    userId: userIds[0],
    title: 'SDE 60m Design Interview',
    description: 'Deep dive into scalable product planning, database schemas, and MERN integrations.',
    duration: 60,
    slug: 'system-design',
    timezone: 'Asia/Kolkata',
  },
  {
    userId: userIds[1],
    title: 'Creative Sync 15m',
    description: 'Fast alignment for design tokens, typography, and shadcn styling rules.',
    duration: 15,
    slug: 'creative-sync',
    timezone: 'UTC',
  },
];

const sampleAvailability = (userIds: string[]) => [
  {
    userId: userIds[0],
    timezone: 'Asia/Kolkata',
    weeklySlots: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', active: true },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', active: true },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', active: true },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', active: true },
      { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', active: true },
      { dayOfWeek: 6, startTime: '09:00', endTime: '17:00', active: false },
      { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', active: false },
    ],
    dateOverrides: [],
  },
  {
    userId: userIds[1],
    timezone: 'UTC',
    weeklySlots: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '16:00', active: true },
      { dayOfWeek: 2, startTime: '10:00', endTime: '16:00', active: true },
      { dayOfWeek: 3, startTime: '10:00', endTime: '16:00', active: true },
      { dayOfWeek: 4, startTime: '10:00', endTime: '16:00', active: true },
      { dayOfWeek: 5, startTime: '10:00', endTime: '16:00', active: false },
      { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', active: false },
      { dayOfWeek: 0, startTime: '10:00', endTime: '16:00', active: false },
    ],
    dateOverrides: [],
  },
];

const sampleBookings = (eventTypeIds: string[], userIds: string[]) => [
  {
    eventTypeId: eventTypeIds[0],
    hostId: userIds[0],
    guestName: 'Carol Guest',
    guestEmail: 'carol@guest.dev',
    guestTimezone: 'Asia/Kolkata',
    bookerName: 'Carol Guest',
    bookerEmail: 'carol@guest.dev',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    status: 'scheduled',
  },
  {
    eventTypeId: eventTypeIds[1],
    hostId: userIds[0],
    guestName: 'Dan Recruiter',
    guestEmail: 'dan@recruiting.dev',
    guestTimezone: 'Asia/Kolkata',
    bookerName: 'Dan Recruiter',
    bookerEmail: 'dan@recruiting.dev',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // day after tomorrow
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    status: 'scheduled',
  },
];

export async function seedDatabase(): Promise<void> {
  try {
    console.log('[SEED SYSTEM]: Cleaning existing datasets...');
    await UserModel.deleteMany({});
    await EventTypeModel.deleteMany({});
    await AvailabilityModel.deleteMany({});
    await BookingModel.deleteMany({});

    console.log('[SEED SYSTEM]: Inserting sample users...');
    const insertedUsers = await UserModel.insertMany(sampleUsers);
    const userIds = insertedUsers.map((u) => u._id.toString());

    console.log('[SEED SYSTEM]: Inserting sample event types...');
    const insertedEventTypes = await EventTypeModel.insertMany(sampleEventTypes(userIds));
    const eventTypeIds = insertedEventTypes.map((e) => e._id.toString());

    console.log('[SEED SYSTEM]: Inserting availability slots matrix...');
    await AvailabilityModel.insertMany(sampleAvailability(userIds));

    console.log('[SEED SYSTEM]: Inserting scheduled guest bookings...');
    await BookingModel.insertMany(sampleBookings(eventTypeIds, userIds));

    console.log('[SEED SYSTEM]: Database seeded successfully with core resources.');
  } catch (error: any) {
    console.error(`[SEED SYSTEM ERROR]: Failure populating database: ${error.message}`);
    throw error;
  }
}

// Support executing seed process directly via CLI command execution
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      console.log('[SEED SYSTEM]: Process finished successfully. Shutting down connection...');
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('[SEED SYSTEM FATAL]: Boot failure:', err);
      process.exit(1);
    }
  })();
}
