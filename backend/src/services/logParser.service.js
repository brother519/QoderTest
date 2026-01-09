const esClient = require('../config/elasticsearch');
const redis = require('../config/redis');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');

class LogParserService {
  constructor() {
    this.buffer = [];
    this.bufferSize = 100;
    this.flushInterval = 500; // ms
    this.startAutoFlush();
  }

  // 解析日志数据
  parseLog(rawLog, source = 'http') {
    try {
      // 尝试解析JSON格式
      if (typeof rawLog === 'string') {
        try {
          const parsed = JSON.parse(rawLog);
          return this.normalizeLog(parsed, source, true);
        } catch (e) {
          // 不是JSON,尝试纯文本解析
          return this.parseTextLog(rawLog, source);
        }
      } else if (typeof rawLog === 'object') {
        return this.normalizeLog(rawLog, source, true);
      }
      
      throw new Error('无效的日志格式');
    } catch (error) {
      logger.error('日志解析失败:', error);
      throw error;
    }
  }

  // 纯文本日志解析
  parseTextLog(text, source) {
    // 匹配常见日志格式: [2026-01-09 10:30:00] ERROR: message
    const pattern = /^\[?(\d{4}-\d{2}-\d{2}[\s|T]\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z)?)\]?\s*(\w+)?\s*[:\-]?\s*(.+)$/;
    const match = text.match(pattern);

    if (match) {
      const [, timestamp, level, message] = match;
      return this.normalizeLog({
        timestamp,
        level: level || 'info',
        message: message.trim()
      }, source, true);
    }

    // 无法匹配标准格式,作为普通消息处理
    return this.normalizeLog({
      message: text,
      level: 'info'
    }, source, false);
  }

  // 标准化日志格式
  normalizeLog(log, source, parsed) {
    const normalized = {
      log_id: uuidv4(),
      '@timestamp': log.timestamp || log['@timestamp'] || new Date().toISOString(),
      service: log.service || 'unknown',
      level: (log.level || 'info').toLowerCase(),
      message: log.message || log.msg || '',
      metadata: log.metadata || log.meta || {},
      source,
      parsed
    };

    // 确保时间戳格式正确
    if (!dayjs(normalized['@timestamp']).isValid()) {
      normalized['@timestamp'] = new Date().toISOString();
    }

    return normalized;
  }

  // 添加日志到缓冲区
  async ingest(rawLog, source = 'http') {
    const parsedLog = this.parseLog(rawLog, source);
    this.buffer.push(parsedLog);

    // 达到缓冲区大小立即刷新
    if (this.buffer.length >= this.bufferSize) {
      await this.flush();
    }

    return parsedLog;
  }

  // 批量接收日志
  async ingestBatch(rawLogs, source = 'http') {
    const parsedLogs = [];
    
    for (const rawLog of rawLogs) {
      try {
        const parsed = this.parseLog(rawLog, source);
        parsedLogs.push(parsed);
        this.buffer.push(parsed);
      } catch (error) {
        logger.error('批量日志解析失败:', error);
      }
    }

    if (this.buffer.length >= this.bufferSize) {
      await this.flush();
    }

    return parsedLogs;
  }

  // 刷新缓冲区到Elasticsearch
  async flush() {
    if (this.buffer.length === 0) return;

    const logsToWrite = [...this.buffer];
    this.buffer = [];

    try {
      const body = logsToWrite.flatMap(log => [
        { index: { _index: 'logs-write', _id: log.log_id } },
        log
      ]);

      const result = await esClient.bulk({ body, refresh: false });

      if (result.errors) {
        const failedDocs = [];
        result.items.forEach((item, idx) => {
          if (item.index?.error) {
            failedDocs.push(logsToWrite[idx]);
            logger.error('ES写入失败:', item.index.error);
          }
        });

        // 重试失败的文档
        if (failedDocs.length > 0 && failedDocs.length < logsToWrite.length) {
          await this.retryFailedDocs(failedDocs);
        }
      }

      // 发布到Redis供WebSocket消费
      for (const log of logsToWrite) {
        await redis.publish('logs:stream', JSON.stringify(log));
      }

      logger.info(`成功写入${logsToWrite.length}条日志到ES`);
    } catch (error) {
      logger.error('ES批量写入失败:', error);
      // 将失败的日志放回缓冲区
      this.buffer.unshift(...logsToWrite);
      throw error;
    }
  }

  // 重试失败的文档
  async retryFailedDocs(docs, attempt = 1, maxAttempts = 3) {
    if (attempt > maxAttempts) {
      logger.error(`${docs.length}条日志重试${maxAttempts}次后仍失败`);
      return;
    }

    try {
      const body = docs.flatMap(log => [
        { index: { _index: 'logs-write', _id: log.log_id } },
        log
      ]);

      await esClient.bulk({ body });
      logger.info(`第${attempt}次重试成功，写入${docs.length}条日志`);
    } catch (error) {
      logger.error(`第${attempt}次重试失败:`, error);
      // 指数退避
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      await this.retryFailedDocs(docs, attempt + 1, maxAttempts);
    }
  }

  // 自动刷新定时器
  startAutoFlush() {
    setInterval(async () => {
      if (this.buffer.length > 0) {
        await this.flush();
      }
    }, this.flushInterval);
  }
}

module.exports = new LogParserService();
