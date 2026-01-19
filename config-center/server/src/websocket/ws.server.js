const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const { getSubscriber } = require('../config/redis');
const config = require('../config/app.config');

class WebSocketServer {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // connectionId -> { ws, serviceName, environment }
  }
  
  // Initialize WebSocket server
  init(server) {
    this.wss = new WebSocket.Server({ server, path: '/ws' });
    
    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });
    
    // Subscribe to Redis for distributed notifications
    this.subscribeToRedis();
    
    // Start heartbeat
    this.startHeartbeat();
    
    console.log('WebSocket server initialized');
  }
  
  // Handle new connection
  handleConnection(ws, req) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const serviceName = url.searchParams.get('service');
    const environment = url.searchParams.get('env');
    
    if (!serviceName || !environment) {
      ws.close(4000, 'Missing service or environment parameter');
      return;
    }
    
    const connectionId = uuidv4();
    
    this.clients.set(connectionId, {
      ws,
      serviceName,
      environment,
      lastPong: Date.now()
    });
    
    // Send connection acknowledgment
    this.send(ws, {
      type: 'connection_ack',
      data: {
        connectionId,
        subscribed: { serviceName, environment },
        timestamp: Date.now()
      }
    });
    
    // Handle messages
    ws.on('message', (message) => {
      this.handleMessage(connectionId, message);
    });
    
    // Handle close
    ws.on('close', () => {
      this.clients.delete(connectionId);
    });
    
    // Handle error
    ws.on('error', (error) => {
      console.error('WebSocket error:', error.message);
      this.clients.delete(connectionId);
    });
    
    console.log(`Client connected: ${connectionId} (${serviceName}/${environment})`);
  }
  
  // Handle incoming message
  handleMessage(connectionId, message) {
    try {
      const data = JSON.parse(message);
      const client = this.clients.get(connectionId);
      
      if (!client) return;
      
      switch (data.type) {
        case 'pong':
          client.lastPong = Date.now();
          break;
          
        case 'subscribe':
          // Allow changing subscription
          if (data.data?.serviceName && data.data?.environment) {
            client.serviceName = data.data.serviceName;
            client.environment = data.data.environment;
          }
          break;
      }
    } catch (error) {
      console.error('Message parse error:', error.message);
    }
  }
  
  // Send message to client
  send(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
  
  // Broadcast to specific service/environment
  broadcast(serviceName, environment, message) {
    for (const [, client] of this.clients) {
      if (client.serviceName === serviceName && client.environment === environment) {
        this.send(client.ws, message);
      }
    }
  }
  
  // Broadcast to all clients
  broadcastAll(message) {
    for (const [, client] of this.clients) {
      this.send(client.ws, message);
    }
  }
  
  // Subscribe to Redis Pub/Sub
  subscribeToRedis() {
    try {
      const subscriber = getSubscriber();
      
      subscriber.psubscribe('channel:config:*', (err) => {
        if (err) {
          console.error('Redis subscribe error:', err.message);
        }
      });
      
      subscriber.on('pmessage', (pattern, channel, message) => {
        try {
          const data = JSON.parse(message);
          const { serviceName, environment } = data;
          
          if (serviceName && environment) {
            this.broadcast(serviceName, environment, {
              type: 'config_changed',
              data
            });
          }
        } catch (error) {
          console.error('Redis message error:', error.message);
        }
      });
    } catch (error) {
      console.error('Redis subscriber init error:', error.message);
    }
  }
  
  // Heartbeat to keep connections alive
  startHeartbeat() {
    setInterval(() => {
      const now = Date.now();
      
      for (const [connectionId, client] of this.clients) {
        // Check if client responded to last ping
        if (now - client.lastPong > config.websocket.heartbeatInterval + config.websocket.heartbeatTimeout) {
          console.log(`Client timeout: ${connectionId}`);
          client.ws.terminate();
          this.clients.delete(connectionId);
          continue;
        }
        
        // Send ping
        this.send(client.ws, { type: 'ping', timestamp: now });
      }
    }, config.websocket.heartbeatInterval);
  }
  
  // Get connection count
  getConnectionCount() {
    return this.clients.size;
  }
}

module.exports = new WebSocketServer();
