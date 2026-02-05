const redis = require('../config/redis');
const esService = require('./elasticsearch.service');
const logger = require('../utils/logger');

class AlertMatcherService {
  constructor() {
    this.rules = [];
    this.loadRules();
    // 每分钟重新加载规则
    setInterval(() => this.loadRules(), 60000);
  }

  // 加载所有启用的告警规则
  async loadRules() {
    try {
      const allRules = await esService.getAlertRules();
      this.rules = allRules.filter(r => r.enabled);
      logger.info(`已加载${this.rules.length}条告警规则`);
    } catch (error) {
      logger.error('加载告警规则失败:', error);
    }
  }

  // 匹配日志与规则
  async matchLog(log) {
    for (const rule of this.rules) {
      if (await this.isMatch(log, rule)) {
        await this.handleMatch(log, rule);
      }
    }
  }

  // 检查日志是否匹配规则
  async isMatch(log, rule) {
    const { conditions } = rule;

    // 级别匹配
    if (conditions.level && log.level !== conditions.level) {
      return false;
    }

    // 服务名匹配
    if (conditions.service && log.service !== conditions.service) {
      return false;
    }

    // 正则模式匹配
    if (conditions.pattern) {
      try {
        const regex = new RegExp(conditions.pattern, 'i');
        if (!regex.test(log.message)) {
          return false;
        }
      } catch (error) {
        logger.error(`规则${rule.rule_id}的正则表达式无效:`, error);
        return false;
      }
    }

    return true;
  }

  // 处理匹配的日志
  async handleMatch(log, rule) {
    const { rule_id, conditions } = rule;
    const window = this.parseWindow(conditions.window || '5m');
    const threshold = conditions.threshold || 1;

    try {
      // 添加到滑动窗口
      const now = Date.now();
      const windowKey = `alert:window:${rule_id}`;
      
      await redis.zadd(windowKey, now, log.log_id);
      await redis.zremrangebyscore(windowKey, 0, now - window);
      await redis.expire(windowKey, Math.ceil(window / 1000) + 60);

      // 统计窗口内数量
      const count = await redis.zcount(windowKey, now - window, now);

      if (count >= threshold) {
        // 检查是否在冷却期
        const firedKey = `alert:fired:${rule_id}`;
        const alreadyFired = await redis.get(firedKey);

        if (!alreadyFired) {
          await this.triggerAlert(rule, count, log);
          // 设置冷却期（10分钟）
          await redis.setex(firedKey, 600, '1');
        }
      }
    } catch (error) {
      logger.error('处理告警匹配失败:', error);
    }
  }

  // 触发告警
  async triggerAlert(rule, count, triggeredLog) {
    logger.warn(`触发告警: ${rule.name}, 计数: ${count}`);

    // 这里可以发送邮件、Webhook等
    // 简化实现,仅记录日志
    const alertData = {
      rule_id: rule.rule_id,
      rule_name: rule.name,
      triggered_at: new Date().toISOString(),
      count,
      sample_log: triggeredLog
    };

    // 可以将告警信息发送到队列,由Worker处理
    await redis.lpush('alert:queue', JSON.stringify(alertData));
    
    logger.info('告警已加入队列:', alertData);
  }

  // 解析时间窗口
  parseWindow(window) {
    const units = {
      's': 1000,
      'm': 60000,
      'h': 3600000,
      'd': 86400000
    };

    const match = window.match(/^(\d+)([smhd])$/);
    if (match) {
      const [, value, unit] = match;
      return parseInt(value) * units[unit];
    }

    return 300000; // 默认5分钟
  }
}

module.exports = new AlertMatcherService();
