import prisma from '../../config/db.js';
import { sendEmail } from './emailService.js';
import logger from '../../utils/logger.js';

/**
 * Email queue service — enqueue, process, and retry email delivery
 */
const emailQueueService = {
  /**
   * Enqueue an email for later delivery
   */
  async enqueue({ userId, recipient, subject, body, scheduledAt = null }) {
    return prisma.emailQueue.create({
      data: {
        userId,
        recipient,
        subject,
        body,
        status: 'PENDING',
        scheduledAt
      }
    });
  },

  /**
   * Process all pending emails in the queue
   */
  async processQueue() {
    const pendingEmails = await prisma.emailQueue.findMany({
      where: {
        status: 'PENDING',
        OR: [
          { scheduledAt: null },
          { scheduledAt: { lte: new Date() } }
        ]
      },
      orderBy: { createdAt: 'asc' },
      take: 20 // Process up to 20 at a time
    });

    if (pendingEmails.length === 0) return;

    logger.info(`Processing ${pendingEmails.length} queued emails...`);

    for (const email of pendingEmails) {
      try {
        const result = await sendEmail(email.recipient, 'raw', {});

        if (result.success || result.reason === 'SMTP not configured') {
          // If SMTP not configured, mark as SENT anyway to avoid infinite retries
          await prisma.emailQueue.update({
            where: { id: email.id },
            data: {
              status: 'SENT',
              sentAt: new Date()
            }
          });
        } else {
          throw new Error(result.reason);
        }
      } catch (error) {
        const newRetryCount = email.retryCount + 1;
        const newStatus = newRetryCount >= 3 ? 'FAILED' : 'PENDING';

        await prisma.emailQueue.update({
          where: { id: email.id },
          data: {
            retryCount: newRetryCount,
            status: newStatus
          }
        });

        logger.warn(`Email queue item ${email.id} ${newStatus} (attempt ${newRetryCount}/3): ${error.message}`);
      }
    }
  },

  /**
   * Quick helper — enqueue and attempt immediate send via the raw transport
   */
  async sendDirect({ userId, recipient, template, templateData }) {
    const result = await sendEmail(recipient, template, templateData);

    // Also record in the queue for audit
    await this.enqueue({
      userId,
      recipient,
      subject: `[${template}] notification`,
      body: JSON.stringify(templateData),
      scheduledAt: null
    });

    // Mark as sent if it succeeded
    if (result.success) {
      const latest = await prisma.emailQueue.findFirst({
        where: { userId, recipient },
        orderBy: { createdAt: 'desc' }
      });
      if (latest) {
        await prisma.emailQueue.update({
          where: { id: latest.id },
          data: { status: 'SENT', sentAt: new Date() }
        });
      }
    }

    return result;
  }
};

export default emailQueueService;
