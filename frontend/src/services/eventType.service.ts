import { apiClient, invalidateApiCache } from './apiClient';

export interface EventTypePayload {
  title: string;
  slug: string;
  duration: number;
  timezone: string;
  description?: string;
  isActive?: boolean;
}

export class EventTypeService {
  /**
   * Fetch all event template configurations.
   */
  static async fetchEventTypes(): Promise<any[]> {
    const res = await apiClient.get<any>('/event-types');
    return res.data.data;
  }

  /**
   * Create reusable event type template configuration.
   */
  static async createEventType(payload: EventTypePayload): Promise<any> {
    invalidateApiCache();
    const res = await apiClient.post<any>('/event-types', payload);
    return res.data.data;
  }

  /**
   * Update reusable event type template configuration.
   */
  static async updateEventType(id: string, payload: EventTypePayload): Promise<any> {
    invalidateApiCache();
    const res = await apiClient.put<any>(`/event-types/${id}`, payload);
    return res.data.data;
  }

  /**
   * Delete reusable event type template configuration.
   */
  static async deleteEventType(id: string): Promise<any> {
    invalidateApiCache();
    const res = await apiClient.delete<any>(`/event-types/${id}`);
    return res.data.data;
  }
}

export default EventTypeService;
