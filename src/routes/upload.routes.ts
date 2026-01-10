import { FastifyInstance } from 'fastify';
import { uploadController } from '../controllers/upload.controller';

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/multipart/init', uploadController.initMultipart);
  
  app.post('/multipart/presigned-url', uploadController.getPresignedUrl);
  
  app.post('/multipart/record-part', uploadController.recordPart);
  
  app.post('/multipart/complete', uploadController.completeMultipart);
  
  app.post('/multipart/abort', uploadController.abortMultipart);
  
  app.get('/multipart/status/:uploadId', uploadController.getUploadStatus);
}
