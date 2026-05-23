import dayjs from 'dayjs';
import { User } from '../models/User.model';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../constants/http';

export class GoogleCalendarService {
  /**
   * Refreshes the Google OAuth access token using the stored offline refresh token.
   */
  static async refreshAccessToken(hostId: string): Promise<string> {
    const host = await User.findById(hostId);
    if (!host || !host.googleRefreshToken) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'GOOGLE_NOT_CONNECTED', 'Google Calendar integration is not configured or refresh token is missing.');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('[Google OAuth Configuration Error]: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment.');
      throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'GOOGLE_CONFIG_ERROR', 'Google OAuth credentials are not configured on the server.');
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: host.googleRefreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as any;
        console.error('[Google Token Refresh Failure]:', errorData);
        throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'GOOGLE_REFRESH_FAILED', 'Failed to refresh Google OAuth access token.');
      }

      const data = (await response.json()) as any;
      const newAccessToken = data.access_token;
      const expiresInSeconds = data.expires_in || 3600;
      const newExpiry = new Date(Date.now() + expiresInSeconds * 1000);

      host.googleAccessToken = newAccessToken;
      host.googleTokenExpiry = newExpiry;
      await host.save();

      console.log(`[Google OAuth Success]: Successfully refreshed access token for host: ${host.email}`);
      return newAccessToken;
    } catch (error: any) {
      console.error('[Google Token Refresh Error]:', error);
      throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'GOOGLE_REFRESH_ERROR', `Failed to refresh Google token: ${error.message}`);
    }
  }

  /**
   * Checks if host access token is expired and returns a valid active token.
   */
  private static async getValidToken(hostId: string): Promise<string> {
    const host = await User.findById(hostId);
    if (!host) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'HOST_NOT_FOUND', 'Host profile was not found.');
    }

    if (!host.googleAccessToken) {
      return '';
    }

    const expiryTime = host.googleTokenExpiry ? new Date(host.googleTokenExpiry).getTime() : 0;
    // Refresh token if it is expired or expires in the next 5 minutes
    if (expiryTime - Date.now() < 5 * 60 * 1000) {
      return await this.refreshAccessToken(hostId);
    }

    return host.googleAccessToken;
  }

  /**
   * Queries Google's FreeBusy API to fetch occupied slot boundaries for a selected date.
   */
  static async fetchBusySlots(
    hostId: string,
    dateStr: string,
    timezone: string
  ): Promise<{ startTime: Date; endTime: Date }[]> {
    try {
      const accessToken = await this.getValidToken(hostId);
      if (!accessToken) {
        return []; // Google not connected, return zero conflicts
      }

      // Convert target day start and end into host timezone ISO strings
      const timeMin = dayjs.tz(dateStr, timezone).startOf('day').toISOString();
      const timeMax = dayjs.tz(dateStr, timezone).endOf('day').toISOString();

      const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeMin,
          timeMax,
          items: [{ id: 'primary' }],
        }),
      });

      if (!response.ok) {
        const errJson = (await response.json()) as any;
        console.error('[Google FreeBusy Sync Fail]: Status:', response.status, errJson);
        return []; // Fallback cleanly instead of crashing the slot loader
      }

      const data = (await response.json()) as any;
      const busyIntervals = data.calendars?.primary?.busy || [];

      return busyIntervals.map((interval: any) => ({
        startTime: new Date(interval.start),
        endTime: new Date(interval.end),
      }));
    } catch (error) {
      console.error('[Google FreeBusy Service Exception]:', error);
      return []; // Return empty array on connection error so scheduling works locally
    }
  }

  /**
   * Creates a calendar event on the host's primary calendar with Google Meet hangouts enabled.
   */
  static async createEvent(
    hostId: string,
    booking: any,
    eventType: any
  ): Promise<{ googleEventId?: string; googleMeetLink?: string }> {
    try {
      const accessToken = await this.getValidToken(hostId);
      if (!accessToken) {
        return {}; // Sync skipped since host has not connected Google Calendar
      }

      const host = await User.findById(hostId);
      if (!host) return {};

      // Prepare Google Event Resources
      const eventResource: any = {
        summary: `${eventType.title} with ${booking.bookerName}`,
        description: `Scheduled via CalClone.\n\nEvent Type: ${eventType.title}\nDuration: ${eventType.duration} minutes\nGuest Notes: ${booking.guestNotes || 'None'}\n\nTo manage or cancel this booking, use your CalClone dashboard.`,
        start: {
          dateTime: booking.startTime.toISOString(),
        },
        end: {
          dateTime: booking.endTime.toISOString(),
        },
        attendees: [
          { email: booking.bookerEmail, displayName: booking.bookerName },
          { email: host.email, displayName: host.fullName },
        ],
      };

      // Inject conference details for video conferencing if location is google-meet
      if (eventType.locationType === 'google-meet' || !eventType.locationType) {
        eventResource.conferenceData = {
          createRequest: {
            requestId: booking._id.toString(),
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        };
      }

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventResource),
      });

      if (!response.ok) {
        const errorBody = (await response.json()) as any;
        console.error('[Google Event Creation Failure]:', response.status, errorBody);
        return {};
      }

      const eventData = (await response.json()) as any;
      const googleEventId = eventData.id;
      
      // Parse Google Meet Join URI
      let googleMeetLink = '';
      if (eventData.conferenceData?.entryPoints) {
        const meetEntryPoint = eventData.conferenceData.entryPoints.find((ep: any) => ep.entryPointType === 'video');
        if (meetEntryPoint) {
          googleMeetLink = meetEntryPoint.uri;
        }
      }

      console.log(`[Google Event Sync Success]: Created event '${googleEventId}' with Meet: '${googleMeetLink}'`);
      return { googleEventId, googleMeetLink };
    } catch (error) {
      console.error('[Google Calendar Event Sync Exception]:', error);
      return {};
    }
  }

  /**
   * Deletes a calendar event from the host's primary calendar.
   */
  static async deleteEvent(hostId: string, googleEventId: string): Promise<void> {
    try {
      const accessToken = await this.getValidToken(hostId);
      if (!accessToken || !googleEventId) return;

      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorBody = (await response.json()) as any;
        console.error('[Google Event Deletion Failure]:', response.status, errorBody);
      } else {
        console.log(`[Google Event Deleted]: Successfully removed Google event '${googleEventId}'`);
      }
    } catch (error) {
      console.error('[Google Calendar Deletion Exception]:', error);
    }
  }
}
