const logParserService = require('../services/logParser.service');
const alertMatcherService = require('../services/alertMatcher.service');
const logger = require('../utils/logger');

exports.ingestLog = async (req, res) => {
  try {
    const log = await logParserService.ingest(req.body);
    
    // 异步匹配告警规则
    alertMatcherService.matchLog(log).catch(err => {
      logger.error('告警匹配失败:', err);
    });

    res.json({ status: 'success', log_id: log.log_id });
  } catch (error) {
    logger.error('日志接收失败:', error);
    res.status(500).json({ error: '日志接收失败' });
  }
};

exports.ingestBatch = async (req, res) => {
  try {
    const { logs } = req.body;
    
    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ error: '无效的日志数组' });
    }

    if (logs.length > 1000) {
      return res.status(400).json({ error: '批量日志最多1000条' });
    }

    const parsed = await logParserService.ingestBatch(logs);
    
    // 异步匹配告警规则
    parsed.forEach(log => {
      alertMatcherService.matchLog(log).catch(err => {
        logger.error('告警匹配失败:', err);
      });
    });

    res.json({ status: 'success', count: parsed.length });
  } catch (error) {
    logger.error('批量日志接收失败:', error);
    res.status(500).json({ error: '批量日志接收失败' });
  }
};
