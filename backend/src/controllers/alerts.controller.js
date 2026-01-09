const esService = require('../services/elasticsearch.service');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

exports.getRules = async (req, res) => {
  try {
    const rules = await esService.getAlertRules();
    res.json({ rules });
  } catch (error) {
    logger.error('获取告警规则失败:', error);
    res.status(500).json({ error: '获取规则失败' });
  }
};

exports.createRule = async (req, res) => {
  try {
    const rule = {
      ...req.body,
      rule_id: uuidv4(),
      enabled: req.body.enabled !== false
    };

    await esService.createAlertRule(rule);
    res.json({ status: 'success', rule });
  } catch (error) {
    logger.error('创建告警规则失败:', error);
    res.status(500).json({ error: '创建规则失败' });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    await esService.updateAlertRule(id, req.body);
    res.json({ status: 'success' });
  } catch (error) {
    logger.error('更新告警规则失败:', error);
    res.status(500).json({ error: '更新规则失败' });
  }
};

exports.deleteRule = async (req, res) => {
  try {
    const { id } = req.params;
    await esService.deleteAlertRule(id);
    res.json({ status: 'success' });
  } catch (error) {
    logger.error('删除告警规则失败:', error);
    res.status(500).json({ error: '删除规则失败' });
  }
};
