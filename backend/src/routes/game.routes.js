const express = require('express');
const router = express.Router();
const GameController = require('../controllers/game.controller');

router.post('/start', GameController.startGame);
router.post('/:sessionId/click', GameController.clickCard);
router.get('/:sessionId/state', GameController.getGameState);
router.post('/:sessionId/restart', GameController.restartGame);

module.exports = router;
