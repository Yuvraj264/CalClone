import dayjs from 'dayjs';

/**
 * Format ISO date string into readable calendar date.
 */
export const formatDate = (date: string | Date, formatStr = 'MMMM D, YYYY'): string => {
  return dayjs(date).format(formatStr);
};

/**
 * Format time range.
 */
export const formatTimeRange = (startTime: string | Date, endTime: string | Date): string => {
  const start = dayjs(startTime).format('HH:mm');
  const end = dayjs(endTime).format('HH:mm');
  return `${start} - ${end}`;
};

/**
 * Format API response errors into clean message strings.
 */
export const formatApiError = (error: any): string => {
  if (error.response?.data?.errors) {
    return error.response.data.errors;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  return error.message || 'An unexpected error occurred.';
};
