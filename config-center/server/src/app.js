const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');

const config = require('./config/app.config');
const configRoutes = require('./routes/config.routes');
const auditRoutes = require('./routes/audit.routes');
const validatorRoutes = require('./routes/validator.routes');
const wsServer = require('./websocket/ws.server');
const notificationService = require('./services/notification.service');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for admin UI
app.use(express.static(path.join(__dirname, '../../admin-ui/dist')));

// API Routes
app.use('/api/v1/configs', configRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/validators', validatorRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    wsConnections: wsServer.getConnectionCount()
  });
});

// API documentation
app.get('/api', (req, res) => {
  res.json({
    version: 'v1',
    endpoints: {
      configs: {
        'GET /api/v1/configs': 'List configs (query: service_name, environment, page, page_size)',
        'GET /api/v1/configs/:id': 'Get config by ID',
        'GET /api/v1/configs/by-key': 'Get config by key (query: service_name, environment, key)',
        'POST /api/v1/configs': 'Create config',
        'PUT /api/v1/configs/:id': 'Update config',
        'DELETE /api/v1/configs/:id': 'Delete config',
        'POST /api/v1/configs/batch': 'Batch get configs',
        'GET /api/v1/configs/:id/versions': 'Get version history',
        'POST /api/v1/configs/:id/rollback': 'Rollback to version'
      },
      audit: {
        'GET /api/v1/audit-logs': 'Query audit logs'
      },
      validators: {
        'POST /api/v1/validators/validate': 'Validate config value'
      },
      websocket: {
        'ws://host/ws?service=xxx&env=xxx': 'WebSocket connection for real-time updates'
      }
    }
  });
});

// Fallback to admin UI for SPA
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../../admin-ui/dist/index.html'));
  } else {
    res.status(404).json({ code: 404, message: 'Not found' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ code: 500, message: 'Internal server error' });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
wsServer.init(server);
notificationService.setWebSocketServer(wsServer);

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`Config Center Server running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log(`WebSocket: ws://localhost:${PORT}/ws`);
});

module.exports = app;
