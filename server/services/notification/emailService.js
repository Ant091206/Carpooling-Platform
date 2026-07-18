import nodemailer from 'nodemailer';
import logger from '../../utils/logger.js';

/**
 * Email sending service using nodemailer.
 * Falls back gracefully when SMTP is not configured.
 */

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user) {
    return null; // SMTP not configured — emails will be queued but not sent
  }

  return nodemailer.createTransport({
    host,
    port: Number(port) || 587,
    secure: Number(port) === 465,
    auth: { user, pass },
  });
};

let transporter = null;

/**
 * Get or initialize transporter lazily
 */
const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

/**
 * HTML email templates
 */
const templates = {
  welcome: (userName) => ({
    subject: 'Welcome to Enterprise Carpooling Platform!',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f0fdf4; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚗 Welcome Aboard!</h1>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #1e293b;">Hi <strong>${userName}</strong>,</p>
          <p style="color: #475569;">Welcome to the Enterprise Carpooling Platform! Start sharing rides, save costs, and reduce your carbon footprint today.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="background: #059669; color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600;">Go to Dashboard</a>
          </div>
        </div>
      </div>
    `
  }),

  rideBooked: (userName, rideDetails) => ({
    subject: 'Ride Booking Confirmed',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f0fdf4; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✅ Booking Confirmed</h1>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #1e293b;">Hi <strong>${userName}</strong>,</p>
          <p style="color: #475569;">Your ride booking has been confirmed.</p>
          <div style="background: white; border-radius: 12px; padding: 20px; margin: 16px 0; border: 1px solid #d1fae5;">
            <p style="margin: 4px 0; color: #374151;"><strong>From:</strong> ${rideDetails.pickup || 'N/A'}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>To:</strong> ${rideDetails.destination || 'N/A'}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Date:</strong> ${rideDetails.date || 'N/A'}</p>
          </div>
        </div>
      </div>
    `
  }),

  rideCancelled: (userName, rideDetails) => ({
    subject: 'Ride Cancelled',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fef2f2; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">❌ Ride Cancelled</h1>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #1e293b;">Hi <strong>${userName}</strong>,</p>
          <p style="color: #475569;">Your ride has been cancelled.</p>
          <div style="background: white; border-radius: 12px; padding: 20px; margin: 16px 0; border: 1px solid #fecaca;">
            <p style="margin: 4px 0; color: #374151;"><strong>Route:</strong> ${rideDetails.pickup || 'N/A'} → ${rideDetails.destination || 'N/A'}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Reason:</strong> ${rideDetails.reason || 'Not specified'}</p>
          </div>
        </div>
      </div>
    `
  }),

  paymentSuccess: (userName, paymentDetails) => ({
    subject: 'Payment Successful',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f0fdf4; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">💰 Payment Received</h1>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #1e293b;">Hi <strong>${userName}</strong>,</p>
          <p style="color: #475569;">Your payment of <strong>₹${paymentDetails.amount || '0'}</strong> has been processed successfully.</p>
        </div>
      </div>
    `
  }),

  paymentFailed: (userName, paymentDetails) => ({
    subject: 'Payment Failed',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fef2f2; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Payment Failed</h1>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #1e293b;">Hi <strong>${userName}</strong>,</p>
          <p style="color: #475569;">Your payment of ₹${paymentDetails.amount || '0'} has failed. Please retry.</p>
        </div>
      </div>
    `
  }),

  rideReminder: (userName, rideDetails) => ({
    subject: `Ride Reminder — ${rideDetails.minutesBefore || ''} minutes away`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #eff6ff; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #2563eb, #3b82f6); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Ride Reminder</h1>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #1e293b;">Hi <strong>${userName}</strong>,</p>
          <p style="color: #475569;">Your ride departs in <strong>${rideDetails.minutesBefore || 'a few'} minutes</strong>.</p>
          <div style="background: white; border-radius: 12px; padding: 20px; margin: 16px 0; border: 1px solid #bfdbfe;">
            <p style="margin: 4px 0; color: #374151;"><strong>From:</strong> ${rideDetails.pickup || 'N/A'}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>To:</strong> ${rideDetails.destination || 'N/A'}</p>
          </div>
        </div>
      </div>
    `
  }),

  passwordChanged: (userName) => ({
    subject: 'Password Changed Successfully',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fffbeb; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #d97706, #f59e0b); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🔒 Password Changed</h1>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #1e293b;">Hi <strong>${userName}</strong>,</p>
          <p style="color: #475569;">Your password was changed successfully. If you didn't do this, please contact support immediately.</p>
        </div>
      </div>
    `
  }),
};

/**
 * Send email via SMTP
 */
const sendEmail = async (to, template, templateData = {}) => {
  const t = getTransporter();
  if (!t) {
    logger.warn(`Email skipped (SMTP not configured): ${template} → ${to}`);
    return { success: false, reason: 'SMTP not configured' };
  }

  const generator = templates[template];
  if (!generator) {
    logger.warn(`Unknown email template: ${template}`);
    return { success: false, reason: 'Unknown template' };
  }

  const { subject, html } = generator(templateData.userName || 'User', templateData);

  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || '"Enterprise Carpooling" <noreply@carpooling.com>',
      to,
      subject,
      html
    });
    logger.info(`Email sent: ${template} → ${to}`);
    return { success: true };
  } catch (error) {
    logger.error(`Email send failed: ${template} → ${to}`, error.message);
    return { success: false, reason: error.message };
  }
};

export { templates, sendEmail };
export default { templates, sendEmail };
