import dayjs from 'dayjs';
import { BookingModel } from '../models/Booking.model';
import { EventTypeModel } from '../models/EventType.model';
import { UserModel } from '../models/User';
import { EmailService } from './email.service';
import { AutomationService } from './automation.service';

export class LifecycleEngine {
  private static isRunning = false;
  private static timer: NodeJS.Timeout | null = null;

  /**
   * Starts the background lifecycle scheduler processing loop
   */
  static start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[Lifecycle Engine]: Background scheduler booted and polling database...');

    // Run processing loop every 1 minute
    this.timer = setInterval(async () => {
      try {
        await this.processBookings();
      } catch (err) {
        console.error('[Lifecycle Engine Error]: Loop execution exception:', err);
      }
    }, 60000);

    // Run once immediately on boot
    this.processBookings().catch(err => console.error('[Lifecycle Engine Error]: Initial boot run failed:', err));
  }

  /**
   * Stops the background lifecycle scheduler loop
   */
  static stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('[Lifecycle Engine]: Background scheduler stopped.');
  }

  /**
   * Evaluates all scheduled MERN bookings to perform transitions and send alerts
   */
  private static async processBookings(): Promise<void> {
    const now = new Date();
    
    // Find all active non-final state bookings
    const bookings = await BookingModel.find({
      status: { $in: ['scheduled', 'confirmed', 'upcoming', 'live'] }
    });

    for (const booking of bookings) {
      try {
        const start = dayjs(booking.startTime);
        const end = dayjs(booking.endTime);
        const diffMinutes = start.diff(dayjs(now), 'minute');
        let statusChanged = false;

        const eventType = await EventTypeModel.findById(booking.eventTypeId);
        const host = await UserModel.findById(booking.hostId);
        if (!eventType || !host) continue;

        // 1. Automatic status transitions
        if (dayjs(now).isAfter(end)) {
          // Meeting is fully finished -> Mark Completed
          booking.status = 'completed';
          booking.auditLogs?.push({
            action: 'auto_completed',
            timestamp: now,
            details: 'Booking automatically completed by scheduler due to end time elapsed.'
          });
          statusChanged = true;
          console.log(`[Lifecycle Engine]: Auto-completed Booking '${booking._id.toString()}'`);
        } else if (dayjs(now).isSameOrAfter(start) && dayjs(now).isBefore(end)) {
          // Meeting is happening right now -> Mark Live
          if (booking.status !== 'live') {
            booking.status = 'live';
            booking.auditLogs?.push({
              action: 'auto_live',
              timestamp: now,
              details: 'Booking transitioned to Live state as current time has started.'
            });
            statusChanged = true;
            console.log(`[Lifecycle Engine]: Booking '${booking._id.toString()}' went LIVE.`);
          }
        } else if (diffMinutes <= 24 * 60 && diffMinutes > 0) {
          // Meeting starts in under 24 hours -> Mark Upcoming
          if (booking.status === 'scheduled' || booking.status === 'confirmed') {
            booking.status = 'upcoming';
            statusChanged = true;
            console.log(`[Lifecycle Engine]: Booking '${booking._id.toString()}' marked UPCOMING.`);
          }
        }

        // 2. Transactional reminders dispatch
        if (diffMinutes > 0) {
          // 24 Hours Reminder
          if (diffMinutes <= 24 * 60 && diffMinutes > 23 * 60 + 45 && !booking.remindersSent?.includes('24h')) {
            await EmailService.sendBookingReminder(booking, eventType, host, '24 hours');
            booking.remindersSent?.push('24h');
            statusChanged = true;
          }

          // 1 Hour Reminder
          if (diffMinutes <= 60 && diffMinutes > 50 && !booking.remindersSent?.includes('1h')) {
            await EmailService.sendBookingReminder(booking, eventType, host, '1 hour');
            booking.remindersSent?.push('1h');
            statusChanged = true;
          }

          // 15 Minutes Reminder
          if (diffMinutes <= 15 && diffMinutes > 10 && !booking.remindersSent?.includes('15m')) {
            await EmailService.sendBookingReminder(booking, eventType, host, '15 minutes');
            booking.remindersSent?.push('15m');
            statusChanged = true;
          }
        }

        // 3. Meeting Started / Go-Live Alerts
        if (dayjs(now).isSameOrAfter(start) && dayjs(now).isBefore(end) && !booking.remindersSent?.includes('started')) {
          await EmailService.sendMeetingStarted(booking, eventType, host);
          await AutomationService.triggerWorkflow('created', booking, {
            eventTitle: eventType.title,
            hostName: host.fullName
          });
          booking.remindersSent?.push('started');
          statusChanged = true;
        }

        if (statusChanged) {
          await booking.save();
        }
      } catch (err) {
        console.error(`[Lifecycle Engine]: Failed to process booking '${booking._id.toString()}':`, err);
      }
    }
  }
}
