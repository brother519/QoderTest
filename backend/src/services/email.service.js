const nodemailer = require('nodemailer');
const redis = require('../config/redis');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.startWorker();
  }

  // 启动邮件发送Worker
  startWorker() {
    setInterval(async () => {
      try {
        const alertJson = await redis.rpop('alert:queue');
        if (alertJson) {
          const alert = JSON.parse(alertJson);
          await this.sendAlertEmail(alert);
        }
      } catch (error) {
        logger.error('邮件Worker错误:', error);
      }
    }, 5000);
  }

  // 发送告警邮件
  async sendAlertEmail(alert) {
    const { rule_name, triggered_at, count, sample_log } = alert;

    const html = `
      <h2>日志平台告警通知</h2>
      <p><strong>告警规则:</strong> ${rule_name}</p>
      <p><strong>触发时间:</strong> ${triggered_at}</p>
      <p><strong>匹配日志数:</strong> ${count}</p>
      <h3>示例日志:</h3>
      <pre>${JSON.stringify(sample_log, null, 2)}</pre>
      <hr>
      <p><small>此邮件由日志中央化平台自动发送</small></p>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: alert.emails || process.env.SMTP_USER,
        subject: `[告警] ${rule_name}`,
        html
      });

      logger.info(`告警邮件已发送: ${rule_name}`);
    } catch (error) {
      logger.error('发送告警邮件失败:', error);
      // 重新加入队列(最多重试3次)
      if (!alert.retry_count || alert.retry_count < 3) {
        alert.retry_count = (alert.retry_count || 0) + 1;
        await redis.lpush('alert:queue', JSON.stringify(alert));
      }
    }
  }
}

module.exports = new EmailService();
