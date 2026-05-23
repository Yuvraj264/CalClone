// ApiResponse Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: any;
}

// User Types
export interface IUserBase {
  name: string;
  email: string;
}

export interface IUserDTO extends IUserBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Event Types
export interface IEventTypeBase {
  userId: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  slug: string;
  timezone: string;
}

export interface IEventTypeDTO extends IEventTypeBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type EventType = IEventTypeDTO;

export interface CreateEventTypePayload {
  title: string;
  description?: string;
  duration: number;
  slug: string;
  timezone: string;
  userId?: string;
}

export interface UpdateEventTypePayload {
  title?: string;
  description?: string;
  duration?: number;
  slug?: string;
  timezone?: string;
}

// Availability Types
export interface IWeeklySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface IDateOverride {
  date: string;
  startTime: string;
  endTime: string;
  blocked: boolean;
}

export interface IAvailabilityBase {
  userId: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  timezone: string;
  weeklySlots?: IWeeklySlot[];
  dateOverrides?: IDateOverride[];
}

export interface IAvailabilityDTO extends IAvailabilityBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type Availability = IAvailabilityDTO;

export interface CreateAvailabilityPayload {
  dayOfWeek?: number | string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  userId?: string;
  weeklySlots?: IWeeklySlot[];
  dateOverrides?: IDateOverride[];
}

export interface UpdateAvailabilityPayload {
  dayOfWeek?: number | string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  weeklySlots?: IWeeklySlot[];
  dateOverrides?: IDateOverride[];
}

// Booking Types
export type BookingStatus = 'scheduled' | 'cancelled' | 'completed' | 'confirmed';

export interface IBookingBase {
  eventTypeId: string;
  bookerName: string;
  bookerEmail: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
}

export interface IBookingDTO extends IBookingBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type Booking = IBookingDTO;

export interface CreateBookingPayload {
  eventTypeSlug: string;
  bookerName: string;
  bookerEmail: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
}

export interface BookingResponse {
  success: boolean;
  message: string;
  data: Booking;
}

export type Slot = string;

export interface SlotResponse {
  date: string;
  slots: Slot[];
}

export interface SlotQueryParams {
  slug: string;
  date: string;
}
