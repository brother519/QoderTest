const express = require('express');
const router = express.Router();
const validatorController = require('../controllers/validator.controller');

router.post('/validate', (req, res) => validatorController.validate(req, res));

module.exports = router;
