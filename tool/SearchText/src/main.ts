import express from 'express';
import { AuthController } from './auth';

// TODO: Add environment variable validation
const app = express();
const PORT = process.env.PORT || 3000;

function setupMiddleware(app: express.Application): void {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  console.log('Middleware configured');
}

function startServer(): void {
  setupMiddleware(app);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default startServer;
