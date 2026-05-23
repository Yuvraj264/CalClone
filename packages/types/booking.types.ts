export type BookingStatus = 'scheduled' | 'cancelled' | 'completed' | 'confirmed';

export interface IBookingBase {
  eventTypeId: string;
  bookerName: string;
  bookerEmail: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
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

export type Slot = string; // e.g. "09:00"

export interface SlotResponse {
  date: string;
  slots: Slot[];
}

export interface SlotQueryParams {
  slug: string;
  date: string;
}
