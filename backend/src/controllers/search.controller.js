const esService = require('../services/elasticsearch.service');
const logger = require('../utils/logger');

exports.searchLogs = async (req, res) => {
  try {
    const result = await esService.searchLogs(req.query);
    res.json(result);
  } catch (error) {
    logger.error('搜索日志失败:', error);
    res.status(500).json({ error: '搜索失败' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await esService.getStats(req.query);
    res.json(stats);
  } catch (error) {
    logger.error('获取统计失败:', error);
    res.status(500).json({ error: '获取统计失败' });
  }
};
