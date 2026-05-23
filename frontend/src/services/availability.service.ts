import { apiClient, invalidateApiCache } from './apiClient';

export interface AvailabilityPayload {
  timezone: string;
  slots: {
    weekday: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }[];
}

export class AvailabilityService {
  /**
   * Fetch current host availability template configurations.
   */
  static async fetchAvailability(): Promise<any[]> {
    const res = await apiClient.get<any>('/availability');
    return res.data.data;
  }

  /**
   * Create a new availability template configuration.
   */
  static async createAvailability(payload: AvailabilityPayload): Promise<any> {
    invalidateApiCache();
    const res = await apiClient.post<any>('/availability', payload);
    return res.data.data;
  }

  /**
   * Update existing availability template configuration.
   */
  static async updateAvailability(id: string, payload: AvailabilityPayload): Promise<any> {
    invalidateApiCache();
    const res = await apiClient.put<any>(`/availability/${id}`, payload);
    return res.data.data;
  }
}

export default AvailabilityService;
