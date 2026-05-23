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
