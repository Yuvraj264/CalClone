import { IBooking } from '../models/Booking.model';

/**
 * Formats a javascript Date object into the standard iCalendar UTC representation (YYYYMMDDTHHmmssZ)
 */
export const formatICSDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Generates dynamic timezone-safe .ics invite payload for calendar clients
 */
export const generateICSString = (booking: IBooking, eventType: any, host: any): string => {
  const dtStamp = formatICSDate(booking.createdAt || new Date());
  const dtStart = formatICSDate(booking.startTime);
  const dtEnd = formatICSDate(booking.endTime);
  const summary = `${eventType.title} with ${booking.bookerName}`;
  
  const location = booking.googleMeetLink || eventType.locationType || 'Google Meet (Online)';
  const description = `CalClone Booking ID: ${booking._id.toString()}\\nDuration: ${eventType.duration} minutes\\nTimezone: ${eventType.timezone || 'UTC'}\\n\\nTo reschedule or manage this slot, visit your CalClone profile portal.`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'PRODID:-//CalClone//Scheduling Software v1.0//EN',
    'BEGIN:VEVENT',
    `UID:${booking._id.toString()}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `ORGANIZER;CN="${host.fullName}":MAILTO:${host.email}`,
    `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN="${booking.bookerName}":MAILTO:${booking.bookerEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
};
