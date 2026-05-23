import { Schema, Document, model, Types } from 'mongoose';
import { DEFAULT_TIMEZONE } from '../constants/validation';

export interface IEventType extends Document {
  userId: Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  duration: number; // in minutes
  locationType: 'google-meet' | 'zoom' | 'in-person' | 'phone';
  locationDetails?: string;
  bufferTime: number; // buffer after in minutes
  isPrivate: boolean;
  isActive: boolean;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventTypeSchema = new Schema<IEventType>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID relationship is required'],
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    slug: {
      type: String,
      required: [true, 'URL Slug is required'],
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase alphanumeric characters and hyphens'],
    },
    locationType: { type: String, enum: ['google-meet', 'zoom', 'in-person', 'phone'], default: 'google-meet' },
    locationDetails: { type: String, default: '' },
    bufferTime: { type: Number, default: 0, min: 0 },
    isPrivate: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    timezone: {
      type: String,
      required: [true, 'Timezone is required'],
      default: DEFAULT_TIMEZONE,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
EventTypeSchema.index({ slug: 1 }, { unique: true });
EventTypeSchema.index({ userId: 1, slug: 1 }, { unique: true });
EventTypeSchema.index({ userId: 1, isActive: 1 });

export const EventType = model<IEventType>('EventType', EventTypeSchema);
export const EventTypeModel = EventType;
export default EventType;
