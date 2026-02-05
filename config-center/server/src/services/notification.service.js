const cacheService = require('./cache.service');

class NotificationService {
  constructor() {
    this.wsServer = null;
  }
  
  // Set WebSocket server reference
  setWebSocketServer(wsServer) {
    this.wsServer = wsServer;
  }
  
  // Notify config change
  async notifyConfigChange(serviceName, environment, changeData) {
    const message = {
      event: 'config_changed',
      serviceName,
      environment,
      ...changeData,
      timestamp: Date.now()
    };
    
    // Publish to Redis for distributed setup
    await cacheService.publishChange(serviceName, environment, message);
    
    // Direct WebSocket notification
    if (this.wsServer) {
      this.wsServer.broadcast(serviceName, environment, {
        type: 'config_changed',
        data: message
      });
    }
  }
}

module.exports = new NotificationService();
