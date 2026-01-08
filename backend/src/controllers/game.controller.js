const GameLogicService = require('../services/game-logic.service');
const LevelService = require('../services/level.service');
const stateManager = require('../services/state-manager.service');

class GameController {
    // POST /api/game/start
    static startGame(req, res) {
        try {
            const { levelId } = req.body;

            if (!levelId) {
                return res.status(400).json({
                    success: false,
                    error: '缺少关卡ID'
                });
            }

            // 获取关卡配置
            const level = LevelService.getLevelById(levelId);
            if (!level) {
                return res.status(404).json({
                    success: false,
                    error: '关卡不存在'
                });
            }

            // 生成卡片
            const cards = GameLogicService.generateCards(level.config);

            // 更新遮挡状态
            GameLogicService.updateBlockedState(cards, level.config.cardSize, level.config.overlapThreshold);

            // 创建游戏状态
            const gameState = {
                cards,
                slot: [],
                remainingCards: cards.length,
                isGameOver: false,
                isWin: false,
                levelConfig: level.config
            };

            // 创建会话
            const sessionId = stateManager.createSession(levelId, gameState);

            res.json({
                success: true,
                data: {
                    sessionId,
                    levelId,
                    gameState: {
                        cards,
                        slot: [],
                        remainingCards: cards.length
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // POST /api/game/:sessionId/click
    static clickCard(req, res) {
        try {
            const { sessionId } = req.params;
            const { cardId } = req.body;

            if (cardId === undefined) {
                return res.status(400).json({
                    success: false,
                    error: '缺少卡片ID'
                });
            }

            // 获取会话
            const session = stateManager.getSession(sessionId);
            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: '游戏会话不存在或已过期'
                });
            }

            const { gameState } = session;
            const { cards, slot, levelConfig } = gameState;

            // 查找卡片
            const card = cards.find(c => c.id === cardId);
            if (!card) {
                return res.status(400).json({
                    success: false,
                    error: '卡片不存在'
                });
            }

            // 验证卡片是否可点击
            if (!card.isClickable || card.isInSlot) {
                return res.status(400).json({
                    success: false,
                    error: '卡片不可点击'
                });
            }

            // 检查槽位是否已满
            if (slot.length >= levelConfig.maxSlots) {
                gameState.isGameOver = true;
                gameState.isWin = false;
                stateManager.updateSession(sessionId, gameState);
                
                return res.json({
                    success: true,
                    data: {
                        valid: false,
                        gameOver: true,
                        win: false,
                        message: '槽位已满'
                    }
                });
            }

            // 标记卡片为已进入槽位
            card.isInSlot = true;

            // 添加到槽位
            GameLogicService.addCardToSlot(slot, card);

            // 检查消除
            let eliminatedCards = [];
            let checkResult = GameLogicService.checkElimination(slot);
            
            while (checkResult.canEliminate) {
                const { eliminatedCards: eliminated, remainingSlot } = 
                    GameLogicService.eliminateCards(slot, checkResult.eliminateType);
                
                eliminatedCards = eliminatedCards.concat(eliminated);
                gameState.slot = remainingSlot;
                
                // 继续检查是否还能消除
                checkResult = GameLogicService.checkElimination(remainingSlot);
            }

            // 更新遮挡状态
            const updatedCards = [];
            GameLogicService.updateBlockedState(cards, levelConfig.cardSize, levelConfig.overlapThreshold);
            
            // 收集状态改变的卡片
            cards.forEach(c => {
                if (!c.isInSlot) {
                    updatedCards.push({
                        id: c.id,
                        isClickable: c.isClickable
                    });
                }
            });

            // 检查游戏结束
            const endResult = GameLogicService.checkGameEnd(cards, slot, levelConfig.maxSlots);
            gameState.isGameOver = endResult.isGameOver;
            gameState.isWin = endResult.isWin;
            gameState.remainingCards = cards.filter(c => !c.isInSlot).length;

            // 更新会话
            stateManager.updateSession(sessionId, gameState);

            res.json({
                success: true,
                data: {
                    valid: true,
                    cardMoved: true,
                    slot: slot.map(c => ({ id: c.id, type: c.type })),
                    eliminated: eliminatedCards.length > 0,
                    eliminatedCards: eliminatedCards.map(c => ({ id: c.id, type: c.type })),
                    updatedCards,
                    gameOver: gameState.isGameOver,
                    win: gameState.isWin,
                    remainingCards: gameState.remainingCards
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET /api/game/:sessionId/state
    static getGameState(req, res) {
        try {
            const { sessionId } = req.params;

            const session = stateManager.getSession(sessionId);
            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: '游戏会话不存在或已过期'
                });
            }

            const { gameState } = session;

            res.json({
                success: true,
                data: {
                    sessionId,
                    cards: gameState.cards,
                    slot: gameState.slot,
                    remainingCards: gameState.remainingCards,
                    isGameOver: gameState.isGameOver,
                    isWin: gameState.isWin
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // POST /api/game/:sessionId/restart
    static restartGame(req, res) {
        try {
            const { sessionId } = req.params;

            const session = stateManager.getSession(sessionId);
            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: '游戏会话不存在或已过期'
                });
            }

            // 删除旧会话，创建新游戏
            stateManager.deleteSession(sessionId);

            // 使用相同的关卡ID创建新游戏
            const level = LevelService.getLevelById(session.levelId);
            const cards = GameLogicService.generateCards(level.config);
            GameLogicService.updateBlockedState(cards, level.config.cardSize, level.config.overlapThreshold);

            const gameState = {
                cards,
                slot: [],
                remainingCards: cards.length,
                isGameOver: false,
                isWin: false,
                levelConfig: level.config
            };

            const newSessionId = stateManager.createSession(session.levelId, gameState);

            res.json({
                success: true,
                data: {
                    sessionId: newSessionId,
                    levelId: session.levelId,
                    gameState: {
                        cards,
                        slot: [],
                        remainingCards: cards.length
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = GameController;
