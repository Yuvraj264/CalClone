import nodemailer from 'nodemailer';
import dayjs from 'dayjs';

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Initializes or returns the cached Nodemailer transporter.
   */
  private static async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;

    // Use SMTP options from environment if specified, fallback to Ethereal Mail dynamic developer account
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      console.log('[Email Engine Success]: Transporter configured using env SMTP credentials.');
    } else {
      // dynamic ethereal mail development account
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.log(`[Email Engine Dev Success]: Configured Ethereal dynamically. User: ${testAccount.user}`);
      } catch (err) {
        console.error('[Email Engine Init Fail]: Could not configure dynamic Ethereal transporter. Falling back to console logging.', err);
        // Fallback transporter that logs to console
        this.transporter = nodemailer.createTransport({
          jsonTransport: true,
        });
      }
    }

    return this.transporter;
  }

  /**
   * Dispatches the email and logs an Ethereal link to terminal if using Ethereal.
   */
  private static async sendMail(options: nodemailer.SendMailOptions): Promise<void> {
    try {
      const client = await this.getTransporter();
      const mailOptions = {
        from: '"CalClone Notifications" <noreply@calclone.dev>',
        ...options,
      };

      const info = await client.sendMail(mailOptions);
      console.log(`[Email Dispatched]: Sent '${options.subject}' to '${options.to}'`);

      // If Ethereal test account is active, log a direct browser link to preview the HTML email!
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) {
        console.log(`[Ethereal HTML Preview Link]: 👉 ${testUrl} 👈`);
      }
    } catch (error) {
      console.error('[Email Dispatched Error]: Failed to send notification email:', error);
    }
  }

  /**
   * Dispatches a booking confirmation email to guest and host.
   */
  static async sendBookingConfirmation(booking: any, eventType: any, host: any): Promise<void> {
    const startFormatted = dayjs(booking.startTime).format('dddd, MMMM D, YYYY [at] h:mm A');
    const meetDetails = booking.googleMeetLink
      ? `<p style="margin-top: 15px;"><strong>Google Meet Details:</strong> <a href="${booking.googleMeetLink}" style="color: #111111; font-weight: bold; text-decoration: underline;">Join Meeting</a></p>`
      : '';

    const htmlContent = `
      <div style="font-family: 'Inter', sans-serif; color: #111111; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">Meeting Confirmed 🎉</h2>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 25px;">Your appointment has been successfully scheduled.</p>
        
        <div style="padding: 15px; background: #f9fafb; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="font-size: 15px; font-weight: bold; margin-top: 0; margin-bottom: 10px;">${eventType.title}</h3>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Date & Time:</strong> ${startFormatted} (UTC)</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Duration:</strong> ${eventType.duration} minutes</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Host:</strong> ${host.fullName} (${host.email})</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Guest:</strong> ${booking.bookerName} (${booking.bookerEmail})</p>
          ${meetDetails}
        </div>

        <p style="font-size: 12px; color: #9ca3af; line-height: 1.5;">
          To cancel or reschedule this meeting, click the link below:<br />
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/book/${eventType.slug}?rescheduleId=${booking._id.toString()}" style="color: #3b82f6; text-decoration: none;">Reschedule this event</a>
        </p>
      </div>
    `;

    // Send to guest
    await this.sendMail({
      to: booking.bookerEmail,
      subject: `Confirmed: ${eventType.title} with ${host.fullName}`,
      html: htmlContent,
    });

    // Send to host
    await this.sendMail({
      to: host.email,
      subject: `Confirmed: ${eventType.title} with ${booking.bookerName}`,
      html: htmlContent,
    });
  }

  /**
   * Dispatches a cancellation notification email to guest and host.
   */
  static async sendBookingCancellation(booking: any, eventType: any, host: any): Promise<void> {
    const startFormatted = dayjs(booking.startTime).format('dddd, MMMM D, YYYY [at] h:mm A');

    const htmlContent = `
      <div style="font-family: 'Inter', sans-serif; color: #111111; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 5px; color: #dc2626;">Meeting Cancelled 🛑</h2>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 25px;">The following meeting has been cancelled.</p>
        
        <div style="padding: 15px; background: #fef2f2; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #dc2626;">
          <h3 style="font-size: 15px; font-weight: bold; margin-top: 0; margin-bottom: 10px; color: #991b1b;">${eventType.title}</h3>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Original Time:</strong> ${startFormatted} (UTC)</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Host:</strong> ${host.fullName}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Guest:</strong> ${booking.bookerName}</p>
        </div>
        
        <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">
          You can book a new slot at any time by visiting:<br />
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/book/${eventType.slug}" style="color: #3b82f6; text-decoration: none;">Book a new meeting link</a>
        </p>
      </div>
    `;

    // Send to guest
    await this.sendMail({
      to: booking.bookerEmail,
      subject: `Cancelled: ${eventType.title} with ${host.fullName}`,
      html: htmlContent,
    });

    // Send to host
    await this.sendMail({
      to: host.email,
      subject: `Cancelled: ${eventType.title} with ${booking.bookerName}`,
      html: htmlContent,
    });
  }

  /**
   * Dispatches a rescheduled notification email to guest and host.
   */
  static async sendBookingRescheduled(
    booking: any,
    eventType: any,
    host: any,
    oldTime: Date
  ): Promise<void> {
    const oldFormatted = dayjs(oldTime).format('dddd, MMMM D, YYYY [at] h:mm A');
    const newFormatted = dayjs(booking.startTime).format('dddd, MMMM D, YYYY [at] h:mm A');
    const meetDetails = booking.googleMeetLink
      ? `<p style="margin-top: 15px;"><strong>New Google Meet Details:</strong> <a href="${booking.googleMeetLink}" style="color: #111111; font-weight: bold; text-decoration: underline;">Join Meeting</a></p>`
      : '';

    const htmlContent = `
      <div style="font-family: 'Inter', sans-serif; color: #111111; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">Meeting Rescheduled 🔄</h2>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 25px;">Your appointment time has been successfully updated.</p>
        
        <div style="padding: 15px; background: #f9fafb; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="font-size: 15px; font-weight: bold; margin-top: 0; margin-bottom: 10px;">${eventType.title}</h3>
          <p style="margin: 4px 0; font-size: 13px; color: #9ca3af; text-decoration: line-through;"><strong>Old Date & Time:</strong> ${oldFormatted} (UTC)</p>
          <p style="margin: 4px 0; font-size: 13px; color: #10b981; font-weight: bold;"><strong>New Date & Time:</strong> ${newFormatted} (UTC)</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Duration:</strong> ${eventType.duration} minutes</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Host:</strong> ${host.fullName} (${host.email})</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Guest:</strong> ${booking.bookerName} (${booking.bookerEmail})</p>
          ${meetDetails}
        </div>

        <p style="font-size: 12px; color: #9ca3af; line-height: 1.5;">
          To cancel or reschedule again, click the link below:<br />
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/book/${eventType.slug}?rescheduleId=${booking._id.toString()}" style="color: #3b82f6; text-decoration: none;">Reschedule this event</a>
        </p>
      </div>
    `;

    // Send to guest
    await this.sendMail({
      to: booking.bookerEmail,
      subject: `Rescheduled: ${eventType.title} with ${host.fullName}`,
      html: htmlContent,
    });

    // Send to host
    await this.sendMail({
      to: host.email,
      subject: `Rescheduled: ${eventType.title} with ${booking.bookerName}`,
      html: htmlContent,
    });
  }

  /**
   * Dispatches booking reminder email to guest and host.
   */
  static async sendBookingReminder(
    booking: any,
    eventType: any,
    host: any,
    timeLabel: string
  ): Promise<void> {
    const startFormatted = dayjs(booking.startTime).format('dddd, MMMM D, YYYY [at] h:mm A');
    const meetDetails = booking.googleMeetLink
      ? `<p style="margin-top: 15px;"><strong>Google Meet Details:</strong> <a href="${booking.googleMeetLink}" style="color: #111111; font-weight: bold; text-decoration: underline;">Join Meeting</a></p>`
      : '';

    const htmlContent = `
      <div style="font-family: 'Inter', sans-serif; color: #111111; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">Upcoming Meeting Reminder ⏰</h2>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 25px;">Your scheduled meeting starts in <strong>${timeLabel}</strong>.</p>
        
        <div style="padding: 15px; background: #f9fafb; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="font-size: 15px; font-weight: bold; margin-top: 0; margin-bottom: 10px;">${eventType.title}</h3>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Date & Time:</strong> ${startFormatted} (UTC)</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Duration:</strong> ${eventType.duration} minutes</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Host:</strong> ${host.fullName}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Guest:</strong> ${booking.bookerName}</p>
          ${meetDetails}
        </div>

        <p style="font-size: 12px; color: #9ca3af; line-height: 1.5;">
          To manage, cancel, or reschedule, click the link below:<br />
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/book/${eventType.slug}?rescheduleId=${booking._id.toString()}" style="color: #3b82f6; text-decoration: none;">Manage this event</a>
        </p>
      </div>
    `;

    await this.sendMail({
      to: booking.bookerEmail,
      subject: `Reminder: ${eventType.title} with ${host.fullName} in ${timeLabel}`,
      html: htmlContent,
    });
  }

  /**
   * Dispatches meeting started email to guest and host when meeting goes live.
   */
  static async sendMeetingStarted(booking: any, eventType: any, host: any): Promise<void> {
    const meetDetails = booking.googleMeetLink
      ? `<div style="margin-top: 20px; text-align: center;"><a href="${booking.googleMeetLink}" style="display: inline-block; background-color: #111111; color: #ffffff; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 14px;">Join Google Meet Now</a></div>`
      : '';

    const htmlContent = `
      <div style="font-family: 'Inter', sans-serif; color: #111111; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 5px; color: #10b981;">Your meeting is starting now! 🚀</h2>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 25px;">Please join your scheduled video call session immediately.</p>
        
        <div style="padding: 15px; background: #ecfdf5; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #10b981;">
          <h3 style="font-size: 15px; font-weight: bold; margin-top: 0; margin-bottom: 10px; color: #065f46;">${eventType.title}</h3>
          <p style="margin: 4px 0; font-size: 13px; color: #065f46;"><strong>Host:</strong> ${host.fullName}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #065f46;"><strong>Guest:</strong> ${booking.bookerName}</p>
          ${meetDetails}
        </div>
      </div>
    `;

    await this.sendMail({
      to: booking.bookerEmail,
      subject: `Live Now: Join ${eventType.title} with ${host.fullName}`,
      html: htmlContent,
    });

    await this.sendMail({
      to: host.email,
      subject: `Live Now: Join ${eventType.title} with ${booking.bookerName}`,
      html: htmlContent,
    });
  }
}
