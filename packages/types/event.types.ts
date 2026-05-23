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
  userId?: string; // Optional if derived from authenticated session
}

export interface UpdateEventTypePayload {
  title?: string;
  description?: string;
  duration?: number;
  slug?: string;
  timezone?: string;
}
