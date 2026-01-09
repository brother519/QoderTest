const Redis = require('ioredis');
const logger = require('../utils/logger');

class LogStreamService {
  constructor(io) {
    this.io = io;
    this.connections = new Map();
    this.subscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    });

    this.setupRedisSubscription();
    this.setupSocketHandlers();
  }

  // 订阅Redis频道
  setupRedisSubscription() {
    this.subscriber.subscribe('logs:stream', (err) => {
      if (err) {
        logger.error('Redis订阅失败:', err);
      } else {
        logger.info('已订阅Redis频道: logs:stream');
      }
    });

    this.subscriber.on('message', (channel, message) => {
      if (channel === 'logs:stream') {
        try {
          const log = JSON.parse(message);
          this.broadcastLog(log);
        } catch (error) {
          logger.error('解析Redis消息失败:', error);
        }
      }
    });
  }

  // 设置Socket.IO处理器
  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`WebSocket连接建立: ${socket.id}`);

      const connectionInfo = {
        socket,
        filters: {},
        lastActivity: Date.now()
      };

      this.connections.set(socket.id, connectionInfo);

      // 处理订阅消息
      socket.on('subscribe', (filters) => {
        connectionInfo.filters = filters || {};
        connectionInfo.lastActivity = Date.now();
        logger.info(`客户端${socket.id}订阅过滤器:`, filters);
        socket.emit('subscribed', { status: 'success', filters });
      });

      // 处理断开连接
      socket.on('disconnect', () => {
        this.connections.delete(socket.id);
        logger.info(`WebSocket连接断开: ${socket.id}`);
      });

      // 心跳检测
      socket.on('ping', () => {
        connectionInfo.lastActivity = Date.now();
        socket.emit('pong');
      });
    });

    // 定期清理超时连接
    setInterval(() => {
      const now = Date.now();
      for (const [id, conn] of this.connections.entries()) {
        if (now - conn.lastActivity > 60000) { // 60秒无活动
          conn.socket.disconnect();
          this.connections.delete(id);
          logger.info(`清理超时连接: ${id}`);
        }
      }
    }, 30000);
  }

  // 广播日志到所有匹配的连接
  broadcastLog(log) {
    for (const [id, conn] of this.connections.entries()) {
      if (this.matchesFilters(log, conn.filters)) {
        conn.socket.emit('log', log);
      }
    }
  }

  // 检查日志是否匹配过滤条件
  matchesFilters(log, filters) {
    // 服务名过滤
    if (filters.service && filters.service.length > 0) {
      if (!filters.service.includes(log.service)) {
        return false;
      }
    }

    // 日志级别过滤
    if (filters.level && filters.level.length > 0) {
      if (!filters.level.includes(log.level)) {
        return false;
      }
    }

    // 关键词过滤
    if (filters.keyword) {
      if (!log.message.includes(filters.keyword)) {
        return false;
      }
    }

    return true;
  }
}

module.exports = LogStreamService;
