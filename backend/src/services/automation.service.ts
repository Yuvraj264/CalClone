import { IBooking } from '../models/Booking.model';

export class AutomationService {
  /**
   * Dispatches trigger-action payloads to active workflow automations
   */
  static async triggerWorkflow(
    event: 'created' | 'cancelled' | 'rescheduled',
    booking: IBooking,
    details: { eventTitle: string; hostName: string }
  ): Promise<void> {
    console.log(`[Automation Engine]: Triggering workflow for event '${event}' on booking '${booking._id.toString()}'`);

    // 1. Mock Slack Notification Payload
    const slackPayload = {
      text: `🔔 *CalClone Automation Alert*: A booking has been *${event}*!`,
      attachments: [
        {
          color: event === 'created' ? '#10b981' : event === 'cancelled' ? '#dc2626' : '#3b82f6',
          fields: [
            { title: 'Event Name', value: details.eventTitle, short: true },
            { title: 'Host', value: details.hostName, short: true },
            { title: 'Guest', value: `${booking.bookerName} (${booking.bookerEmail})`, short: true },
            { title: 'Scheduled Time', value: booking.startTime.toISOString(), short: true },
            { title: 'Meet Link', value: booking.googleMeetLink || 'No Meet Link', short: false },
          ],
        },
      ],
    };
    console.log('[Automation Engine - Slack Mock Dispatch]:\n', JSON.stringify(slackPayload, null, 2));

    // 2. Mock Notion Database Lead Entry
    const notionLead = {
      Name: booking.bookerName,
      Email: booking.bookerEmail,
      Status: event === 'created' ? 'Scheduled' : event === 'cancelled' ? 'Lost' : 'Rescheduled',
      AppointmentTime: booking.startTime,
      Notes: booking.guestNotes || 'None',
      LastUpdated: new Date(),
    };
    console.log('[Automation Engine - Notion/CRM Pipeline Sync]:\n', JSON.stringify(notionLead, null, 2));

    // 3. Configurable HTTP Webhook Dispatch
    const webhookUrl = process.env.WORKFLOW_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        console.log(`[Automation Webhook POST]: Dispatching payload to URL: ${webhookUrl}`);
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, booking, details }),
        });
        if (response.ok) {
          console.log('[Automation Webhook Success]: Dispatch received successfully by target webhook server.');
        } else {
          console.error(`[Automation Webhook Warning]: Target webhook returned status: ${response.status}`);
        }
      } catch (err) {
        console.error('[Automation Webhook Exception]: Failed to POST webhook payload:', err);
      }
    }
  }
}
