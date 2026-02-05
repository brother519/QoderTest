const express = require('express');
const router = express.Router();
const configController = require('../controllers/config.controller');

// Config CRUD
router.get('/', (req, res) => configController.getConfigs(req, res));
router.get('/by-key', (req, res) => configController.getConfigByKey(req, res));
router.get('/:id', (req, res) => configController.getConfigById(req, res));
router.post('/', (req, res) => configController.createConfig(req, res));
router.put('/:id', (req, res) => configController.updateConfig(req, res));
router.delete('/:id', (req, res) => configController.deleteConfig(req, res));

// Batch operations
router.post('/batch', (req, res) => configController.batchGetConfigs(req, res));

// Version management
router.get('/:id/versions', (req, res) => configController.getVersionHistory(req, res));
router.post('/:id/rollback', (req, res) => configController.rollbackConfig(req, res));

module.exports = router;
