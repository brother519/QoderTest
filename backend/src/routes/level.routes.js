const express = require('express');
const router = express.Router();
const LevelController = require('../controllers/level.controller');

router.get('/', LevelController.getAllLevels);
router.get('/:levelId', LevelController.getLevelById);

module.exports = router;
