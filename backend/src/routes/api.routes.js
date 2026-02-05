const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logs.controller');
const searchController = require('../controllers/search.controller');
const alertsController = require('../controllers/alerts.controller');

// 日志接收
router.post('/logs/ingest', logsController.ingestLog);
router.post('/logs/ingest/batch', logsController.ingestBatch);

// 日志搜索
router.get('/logs/search', searchController.searchLogs);
router.get('/logs/stats', searchController.getStats);

// 告警规则
router.get('/alerts/rules', alertsController.getRules);
router.post('/alerts/rules', alertsController.createRule);
router.put('/alerts/rules/:id', alertsController.updateRule);
router.delete('/alerts/rules/:id', alertsController.deleteRule);

module.exports = router;
