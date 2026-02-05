import cron from 'node-cron';
import { multipartUploadService } from '../services/multipart-upload.service';
import { logger } from '../utils/logger.util';

export function startCronJobs() {
  cron.schedule('0 * * * *', async () => {
    logger.info('Running cleanup job for expired multipart sessions');
    try {
      await multipartUploadService.cleanupExpiredSessions();
    } catch (error) {
      logger.error('Cleanup job failed', error);
    }
  });

  logger.info('Cron jobs started');
}
