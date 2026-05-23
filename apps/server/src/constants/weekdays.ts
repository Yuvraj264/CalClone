export const WEEKDAYS = {
  SUNDAY: 'sunday',
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
} as const;

export type Weekday = typeof WEEKDAYS[keyof typeof WEEKDAYS];

export const WEEKDAYS_MAP: Record<Weekday, number> = {
  [WEEKDAYS.SUNDAY]: 0,
  [WEEKDAYS.MONDAY]: 1,
  [WEEKDAYS.TUESDAY]: 2,
  [WEEKDAYS.WEDNESDAY]: 3,
  [WEEKDAYS.THURSDAY]: 4,
  [WEEKDAYS.FRIDAY]: 5,
  [WEEKDAYS.SATURDAY]: 6,
};
