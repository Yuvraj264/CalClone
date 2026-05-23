import { Schema, Document, model, Types } from 'mongoose';

export interface IBooking extends Document {
  eventTypeId: Types.ObjectId;
  hostId: Types.ObjectId;
  guestName: string;
  guestEmail: string;
  guestTimezone: string;
  guestNotes?: string;
  bookerName: string;
  bookerEmail: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled' | 'no-show' | 'upcoming' | 'live';
  googleEventId?: string;
  googleMeetLink?: string;
  cancellationReason?: string;
  cancellationSource?: 'host' | 'attendee';
  cancellationFeedback?: string;
  customAnswers?: { label: string; value: string }[];
  internalNotes?: { id: string; text: string; createdAt: Date; author: string }[];
  remindersSent?: string[];
  auditLogs?: { action: string; timestamp: Date; details: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'EventType',
      required: [true, 'Event type relationship is required'],
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Host ID relationship is required'],
    },
    guestName: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true,
    },
    guestEmail: {
      type: String,
      required: [true, 'Guest email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    guestTimezone: { type: String, required: true, default: 'UTC' },
    guestNotes: { type: String, default: '' },
    bookerName: {
      type: String,
      required: [true, 'Booker name is required'],
      trim: true,
      minlength: [2, 'Booker name must be at least 2 characters'],
      maxlength: [50, 'Booker name cannot exceed 50 characters'],
    },
    bookerEmail: {
      type: String,
      required: [true, 'Booker email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    startTime: {
      type: Date,
      required: [true, 'Booking start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'Booking end time is required'],
      validate: {
        validator: function (this: IBooking, value: Date) {
          return value > this.startTime;
        },
        message: 'End time must be after the booking start time',
      },
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'cancelled', 'completed', 'rescheduled', 'no-show', 'upcoming', 'live'],
      default: 'scheduled',
      required: true,
    },
    googleEventId: { type: String, default: '' },
    googleMeetLink: { type: String, default: '' },
    cancellationReason: { type: String, default: '' },
    cancellationSource: { type: String, enum: ['host', 'attendee'], default: undefined },
    cancellationFeedback: { type: String, default: '' },
    customAnswers: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    internalNotes: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        author: { type: String, required: true },
      },
    ],
    remindersSent: [{ type: String }],
    auditLogs: [
      {
        action: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        details: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
BookingSchema.index({ eventTypeId: 1 });
BookingSchema.index({ startTime: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ hostId: 1, startTime: 1, status: 1 });
BookingSchema.index({ guestEmail: 1 });

// PARTIAL COMPOUND UNIQUE INDEX: Hard barrier against duplicate slot assignments
BookingSchema.index(
  { hostId: 1, startTime: 1, status: 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: 'confirmed' } 
  }
);

export const Booking = model<IBooking>('Booking', BookingSchema);
export const BookingModel = Booking;
export default Booking;
