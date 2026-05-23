import { Booking, CreateBookingPayload } from '@calclone/types';
import { apiClient, invalidateApiCache } from './apiClient';

export class BookingService {
  /**
   * Fetch all bookings with event type details populated, sorted upcoming first.
   */
  static async fetchBookings(): Promise<Booking[]> {
    const res = await apiClient.get<any>('/bookings');
    const payloadData = res.data?.data;
    if (payloadData && typeof payloadData === 'object' && 'bookings' in payloadData) {
      return payloadData.bookings || [];
    }
    return Array.isArray(payloadData) ? payloadData : [];
  }

  /**
   * Fetch a single booking by ID.
   */
  static async fetchBookingById(id: string): Promise<Booking> {
    const res = await apiClient.get<any>(`/bookings/${id}`);
    const payloadData = res.data?.data;
    if (payloadData && typeof payloadData === 'object' && 'booking' in payloadData) {
      return payloadData.booking;
    }
    return payloadData;
  }

  /**
   * Create new guest booking appointment.
   */
  static async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    invalidateApiCache(); // Invalidate local request cache on mutation
    const res = await apiClient.post<any>('/bookings', payload);
    const payloadData = res.data?.data;
    if (payloadData && typeof payloadData === 'object' && 'booking' in payloadData) {
      return payloadData.booking;
    }
    return payloadData;
  }

  /**
   * Cancel an appointment (Status transition scheduled -> cancelled).
   */
  static async cancelBooking(
    id: string,
    payload?: { reason?: string; feedback?: string; source?: 'host' | 'attendee' }
  ): Promise<Booking> {
    invalidateApiCache(); // Invalidate local request cache on mutation
    const res = await apiClient.patch<any>(`/bookings/${id}/cancel`, payload);
    const payloadData = res.data?.data;
    if (payloadData && typeof payloadData === 'object' && 'booking' in payloadData) {
      return payloadData.booking;
    }
    return payloadData;
  }
}

export default BookingService;
