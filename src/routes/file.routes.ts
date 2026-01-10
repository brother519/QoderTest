import { FastifyInstance } from 'fastify';
import { fileController } from '../controllers/file.controller';

export async function fileRoutes(app: FastifyInstance) {
  app.get('/', fileController.listFiles);
  
  app.get('/:fileId', fileController.getFile);
  
  app.get('/:fileId/download', fileController.downloadFile);
  
  app.delete('/:fileId', fileController.deleteFile);
  
  app.patch('/:fileId', fileController.updateFile);
  
  app.post('/:fileId/access-url', fileController.getAccessUrl);
}
