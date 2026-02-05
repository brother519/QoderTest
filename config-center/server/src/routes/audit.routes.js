const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');

router.get('/', (req, res) => auditController.getLogs(req, res));

module.exports = router;
