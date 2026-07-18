import cron from 'node-cron';
import emailQueueService from '../services/notification/emailQueueService.js';
import logger from '../utils/logger.js';

/**
 * Email queue processor cron job
 * Runs every 2 minutes to process pending emails
 */
const startEmailQueueJob = () => {
  cron.schedule('*/2 * * * *', async () => {
    try {
      await emailQueueService.processQueue();
    } catch (error) {
      logger.error('Email queue job error:', error.message);
    }
  });

  logger.info('Email queue processor cron job started (runs every 2 minutes).');
};

export default startEmailQueueJob;
