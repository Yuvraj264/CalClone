import { apiClient } from './apiClient';

export interface SlotResponsePayload {
  date: string;
  slots: string[];
}

export class SlotService {
  /**
   * Fetch available bookable intervals for a target date slug.
   */
  static async fetchAvailableSlots(slug: string, date: string): Promise<SlotResponsePayload> {
    const res = await apiClient.get<any>(`/slots?slug=${slug}&date=${date}`);
    return res.data.data;
  }
}

export default SlotService;
