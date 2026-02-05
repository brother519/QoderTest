import express from 'express';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import { checkConnection as checkESConnection } from './config/elasticsearch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use(routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function start() {
  try {
    // Check Elasticsearch connection
    const esConnected = await checkESConnection();
    if (!esConnected) {
      console.warn('Warning: Elasticsearch connection failed. Search features may not work.');
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Search API: POST http://localhost:${PORT}/api/search`);
      console.log(`Autocomplete API: GET http://localhost:${PORT}/api/autocomplete`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
