export const BOOKING_STATUS = {
  SCHEDULED: 'scheduled',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export type BookingStatusConstant = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export const WEEKDAYS = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

export const DEFAULT_TIMEZONE = 'UTC';
