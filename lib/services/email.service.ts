import { Resend } from 'resend';

// Initialize Resend
// We only initialize if the API key is present. In development/testing, it might not be.
const resendApiKey = process.env.RESEND_API_KEY || 're_mock_key';
const resend = new Resend(resendApiKey);

// Replace with a verified domain
const FROM_EMAIL = 'AlloySphere <noreply@alloysphere.online>';

export const emailService = {
  /**
   * Send a welcome email when a user completes onboarding
   */
  async sendWelcomeEmail(toEmail: string, name: string) {
    try {
      const data = await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject: 'Welcome to AlloySphere!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>Welcome to AlloySphere, ${name}!</h2>
            <p>We're thrilled to have you join our ecosystem of visionary founders, top-tier talent, and active investors.</p>
            <p>Next steps to get the most out of AlloySphere:</p>
            <ul>
              <li><strong>Complete your profile:</strong> A complete profile helps you stand out.</li>
              <li><strong>Discover startups:</strong> Find your next big opportunity or investment.</li>
              <li><strong>Build your network:</strong> Connect with peers and join conversations on the community feed.</li>
            </ul>
            <br/>
            <p>Ready to jump in?</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/home" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
            <br/><br/>
            <p>Best,<br/>The AlloySphere Team</p>
          </div>
        `
      });
      return { data, error: null };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return { data: null, error };
    }
  },

  /**
   * Send an email notification
   */
  async sendNotificationEmail(toEmail: string, subject: string, message: string, actionUrl?: string, actionText?: string) {
    try {
      const actionHtml = actionUrl && actionText ? `
        <br/><br/>
        <a href="${actionUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">${actionText}</a>
      ` : '';

      const data = await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>AlloySphere Notification</h2>
            <p>${message}</p>
            ${actionHtml}
            <br/><br/>
            <p style="font-size: 12px; color: #888;">You received this email because you are registered on AlloySphere. You can update your notification preferences in your Settings.</p>
          </div>
        `
      });
      return { data, error: null };
    } catch (error) {
      console.error('Failed to send notification email:', error);
      return { data: null, error };
    }
  },

  /**
   * Send a connection request email
   */
  async sendConnectionEmail(toEmail: string, title: string, message: string, actionUrl: string) {
    try {
      const data = await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject: 'New Connection Request on AlloySphere',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #0ea5e9;">${title}</h2>
            </div>
            <p>${message}</p>
            <p>Expand your network and collaborate with the best in the ecosystem.</p>
            <br/>
            <div style="text-align: center;">
              <a href="${actionUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">View Request</a>
            </div>
          </div>
        `
      });
      return { data, error: null };
    } catch (error) {
      console.error('Failed to send connection email:', error);
      return { data: null, error };
    }
  },

  /**
   * Send a direct message notification email
   */
  async sendMessageEmail(toEmail: string, senderName: string, messagePreview: string, actionUrl: string) {
    try {
      const data = await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject: `New message from ${senderName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <p style="font-size: 16px;"><strong>${senderName}</strong> sent you a message on AlloySphere:</p>
            <blockquote style="border-left: 4px solid #0ea5e9; padding-left: 16px; color: #555; font-style: italic;">
              "${messagePreview}"
            </blockquote>
            <br/>
            <a href="${actionUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Reply</a>
          </div>
        `
      });
      return { data, error: null };
    } catch (error) {
      console.error('Failed to send message email:', error);
      return { data: null, error };
    }
  },

  /**
   * Send an application/opportunity email
   */
  async sendApplicationEmail(toEmail: string, title: string, message: string, actionUrl: string) {
    try {
      const data = await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject: 'New Application Received!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #10b981;">${title}</h2>
            <p>${message}</p>
            <p>Review this candidate's profile and decide if they are the right fit for your team.</p>
            <br/>
            <a href="${actionUrl}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Review Application</a>
          </div>
        `
      });
      return { data, error: null };
    } catch (error) {
      console.error('Failed to send application email:', error);
      return { data: null, error };
    }
  }
};
