import { Schema, Document, model, Types } from 'mongoose';
import { DEFAULT_TIMEZONE } from '../constants/validation';

export interface IWeeklySlot {
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  startTime: string; // "HH:MM" in 24hr format
  endTime: string;   // "HH:MM" in 24hr format
  active: boolean;
}

export interface IDateOverride {
  date: string; // "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  blocked: boolean;
}

export interface IAvailability extends Document {
  userId: Types.ObjectId;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  timezone: string;
  weeklySlots: IWeeklySlot[];
  dateOverrides: IDateOverride[];
  createdAt: Date;
  updatedAt: Date;
}

const WeeklySlotSchema = new Schema<IWeeklySlot>(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    endTime: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    active: { type: Boolean, default: true },
  },
  { _id: false }
);

const DateOverrideSchema = new Schema<IDateOverride>(
  {
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    startTime: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    endTime: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    blocked: { type: Boolean, default: false },
  },
  { _id: false }
);

const AvailabilitySchema = new Schema<IAvailability>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID relationship is required'],
      unique: true,
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
    },
    startTime: {
      type: String,
      match: [/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format'],
    },
    endTime: {
      type: String,
      match: [/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format'],
    },
    timezone: {
      type: String,
      required: [true, 'Timezone is required'],
      default: DEFAULT_TIMEZONE,
    },
    weeklySlots: [WeeklySlotSchema],
    dateOverrides: [DateOverrideSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes
AvailabilitySchema.index({ userId: 1 }, { unique: true });
AvailabilitySchema.index({ userId: 1, dayOfWeek: 1 });

export const Availability = model<IAvailability>('Availability', AvailabilitySchema);
export const AvailabilityModel = Availability;
export default Availability;
