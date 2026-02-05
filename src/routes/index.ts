import { FastifyInstance } from 'fastify';
import { uploadRoutes } from './upload.routes';
import { fileRoutes } from './file.routes';

export async function registerRoutes(app: FastifyInstance) {
  await app.register(uploadRoutes, { prefix: '/api/v1/upload' });
  await app.register(fileRoutes, { prefix: '/api/v1/files' });
}
