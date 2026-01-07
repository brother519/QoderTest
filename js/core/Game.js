// Game.js - 游戏主控制器
class Game {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.renderer = new CanvasRenderer(canvasId);
        this.stateManager = stateManager;
        this.levelManager = levelManager;
        this.slotManager = new SlotManager();
        this.cards = [];
        this.selectedCard = null;
        this.gameLoopId = null;
        this.lastUpdateTime = 0;
        this.animationQueue = []; // 动画队列
        this.isAnimating = false; // 是否正在动画
        
        // 初始化事件管理器
        this.eventManager = new EventManager(this.renderer.canvas, this);
        
        // 游戏状态变化观察者
        this.stateManager.addObserver(this.onStateChange.bind(this));
    }

    // 启动游戏
    start() {
        this.loadLevel(1);
        this.startGameLoop();
        
        // 更新UI
        this.updateUI();
    }

    // 开始游戏循环
    startGameLoop() {
        const gameLoop = (currentTime) => {
            this.update(currentTime);
            this.render();
            this.gameLoopId = requestAnimationFrame(gameLoop);
        };
        
        this.lastUpdateTime = performance.now();
        gameLoop(this.lastUpdateTime);
    }

    // 更新游戏状态
    update(currentTime) {
        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;
        
        // 更新游戏时间
        if (this.stateManager.isGameActive()) {
            this.stateManager.updateGameTime();
        }
        
        // 更新动画队列
        this.processAnimationQueue();
        
        // 更新卡片状态
        for (const card of this.cards) {
            if (!card.isRemoved()) {
                card.update(deltaTime);
            }
        }
    }

    // 渲染游戏
    render() {
        this.renderer.clear();
        
        // 绘制背景
        this.renderer.drawBackground();
        
        // 过滤掉已移除的卡片
        const activeCards = this.cards.filter(card => !card.isRemoved());
        
        // 绘制所有卡片
        this.renderer.drawCards(activeCards);
        
        // 绘制卡槽
        this.renderer.drawSlotArea(this.slotManager.getCards());
    }

    // 加载关卡
    loadLevel(levelId) {
        // 设置当前关卡
        this.levelManager.setCurrentLevel(levelId);
        
        // 生成关卡布局
        const layoutConfig = this.levelManager.getCurrentLevel().layout;
        this.cards = this.levelManager.generateLayoutForLevel(levelId);
        
        // 重置卡槽
        this.slotManager.clear();
        
        // 开始游戏
        this.stateManager.startGame(levelId);
        
        // 更新UI
        this.updateUI();
    }

    // 处理卡片点击
    handleCardClick(x, y) {
        if (!this.stateManager.isGameActive() || this.isAnimating) {
            return; // 游戏未开始或正在动画时不允许操作
        }
        
        // 获取被点击的卡片
        const clickedCard = collisionDetector.getClickedCard(x, y, this.cards);
        
        if (clickedCard && !clickedCard.isRemoved()) {
            // 如果已经有选中的卡片，取消选中
            if (this.selectedCard && this.selectedCard.id !== clickedCard.id) {
                this.selectedCard.deselect();
            }
            
            // 切换选中状态
            if (this.selectedCard && this.selectedCard.id === clickedCard.id) {
                // 取消选中
                this.selectedCard.deselect();
                this.selectedCard = null;
            } else {
                // 选中新卡片
                clickedCard.select();
                this.selectedCard = clickedCard;
            }
            
            // 更新UI
            this.updateUI();
        } else if (this.selectedCard) {
            // 点击空白处，取消选中
            this.selectedCard.deselect();
            this.selectedCard = null;
            this.updateUI();
        }
    }

    // 处理鼠标移动（悬停效果）
    handleMouseMove(x, y) {
        if (!this.stateManager.isGameActive()) {
            return;
        }
        
        // 这里可以添加悬停效果，比如高亮可点击的卡片
        // 目前主要是为了后续扩展
    }

    // 将选中的卡片移到卡槽
    moveSelectedCardToSlot() {
        if (!this.selectedCard || !this.stateManager.isGameActive()) {
            return false;
        }
        
        // 检查卡槽是否已满
        if (this.slotManager.isFull()) {
            // 检查是否会因为这张卡片导致失败
            if (this.slotManager.isAboutToFull(this.selectedCard.type)) {
                // 卡槽满了且无法消除，游戏失败
                this.stateManager.loseGame();
                this.showGameOver(false);
                return false;
            }
        }
        
        // 将卡片从游戏中移除并添加到卡槽
        const cardToAdd = this.selectedCard;
        
        // 从游戏中移除卡片
        const cardIndex = this.cards.findIndex(c => c.id === cardToAdd.id);
        if (cardIndex !== -1) {
            this.cards.splice(cardIndex, 1);
        }
        
        // 添加到卡槽
        const result = this.slotManager.addCard(cardToAdd);
        
        // 增加移动次数
        this.stateManager.addMove();
        
        // 处理消除
        if (result.removedCards.length > 0) {
            // 有卡片被消除，增加得分
            const points = result.removedCards.length * 10;
            this.stateManager.addScore(points);
            
            // 检查是否获胜
            if (this.checkWinCondition()) {
                this.stateManager.winGame();
                this.showGameOver(true);
            }
        }
        
        // 取消选中
        if (this.selectedCard && this.selectedCard.id === cardToAdd.id) {
            this.selectedCard = null;
        }
        
        // 更新UI
        this.updateUI();
        
        return true;
    }

    // 检查获胜条件
    checkWinCondition() {
        // 检查是否所有游戏卡片都已清除
        const activeCards = this.cards.filter(card => !card.isRemoved());
        return activeCards.length === 0;
    }

    // 更新UI
    updateUI() {
        // 更新得分
        document.getElementById('score').textContent = this.stateManager.getScore();
        
        // 更新关卡
        document.getElementById('level').textContent = this.stateManager.getCurrentLevel();
        
        // 更新移动次数
        document.getElementById('moves').textContent = this.stateManager.getMoveCount();
        
        // 更新卡槽UI
        this.updateSlotUI();
    }

    // 更新卡槽UI
    updateSlotUI() {
        const slotContainer = document.getElementById('slotContainer');
        if (!slotContainer) return;
        
        // 重新创建卡槽元素
        slotContainer.innerHTML = '';
        for (let i = 0; i < GAME_CONFIG.SLOT_CAPACITY; i++) {
            const slotDiv = document.createElement('div');
            slotDiv.className = 'slot-slot';
            slotDiv.id = `slot-${i}`;
            
            if (i < this.slotManager.getCardCount()) {
                const card = this.slotManager.getCardAt(i);
                if (card) {
                    slotDiv.classList.add('has-card');
                    const colorIndex = card.type % GAME_CONFIG.CARD_COLORS.length;
                    slotDiv.style.backgroundColor = GAME_CONFIG.CARD_COLORS[colorIndex];
                    slotDiv.textContent = card.type;
                }
            }
            
            slotContainer.appendChild(slotDiv);
        }
    }

    // 显示游戏结束界面
    showGameOver(isWin) {
        const gameOverDiv = document.getElementById('gameOver');
        const gameResult = document.getElementById('gameResult');
        const finalScore = document.getElementById('finalScore');
        const nextLevelBtn = document.getElementById('nextLevelBtn');
        
        if (isWin) {
            gameResult.textContent = '恭喜过关！';
            gameResult.style.color = '#48bb78';
            
            // 检查是否有下一关
            if (this.levelManager.hasNextLevel()) {
                nextLevelBtn.style.display = 'inline-block';
            } else {
                nextLevelBtn.textContent = '重新开始';
                nextLevelBtn.style.display = 'inline-block';
            }
        } else {
            gameResult.textContent = '挑战失败！';
            gameResult.style.color = '#e53e3e';
            nextLevelBtn.style.display = 'none'; // 失败时不显示下一关按钮
        }
        
        finalScore.textContent = this.stateManager.getScore();
        gameOverDiv.style.display = 'flex';
    }

    // 隐藏游戏结束界面
    hideGameOver() {
        document.getElementById('gameOver').style.display = 'none';
    }

    // 重新开始当前关卡
    restartLevel() {
        const currentLevel = this.stateManager.getCurrentLevel();
        this.loadLevel(currentLevel);
        this.hideGameOver();
    }

    // 重新开始整个游戏
    restartGame() {
        this.loadLevel(1);
        this.hideGameOver();
    }

    // 下一关
    nextLevel() {
        const currentLevel = this.stateManager.getCurrentLevel();
        const nextLevel = this.levelManager.getNextLevel();
        
        if (nextLevel.id > currentLevel) {
            this.loadLevel(nextLevel.id);
            this.hideGameOver();
        } else {
            // 如果已经是最后一关，重新开始
            this.loadLevel(1);
            this.hideGameOver();
        }
    }

    // 切换暂停状态
    togglePause() {
        if (this.stateManager.getStatus() === GAME_CONFIG.GAME_STATUS.PLAYING) {
            this.stateManager.pauseGame();
        } else if (this.stateManager.getStatus() === GAME_CONFIG.GAME_STATUS.PAUSED) {
            this.stateManager.resumeGame();
        }
    }

    // 提供提示
    provideHint() {
        if (!this.stateManager.isGameActive()) {
            return;
        }
        
        // 找到一个可点击的卡片并高亮
        const clickableCards = collisionDetector.getClickableCards(this.cards.filter(c => !c.isRemoved()));
        
        if (clickableCards.length > 0) {
            // 随机选择一个可点击的卡片作为提示
            const randomIndex = Math.floor(Math.random() * clickableCards.length);
            const hintCard = clickableCards[randomIndex];
            
            // 可以通过短暂改变卡片外观来提示
            hintCard.select();
            setTimeout(() => {
                if (this.selectedCard?.id !== hintCard.id) {
                    hintCard.deselect();
                }
            }, 1000);
        }
    }

    // 处理窗口大小变化
    handleResize() {
        // 获取容器大小并调整Canvas
        const container = document.querySelector('.game-area');
        if (container) {
            const containerRect = container.getBoundingClientRect();
            const maxWidth = Math.min(containerRect.width * 0.95, 800);
            const maxHeight = Math.min(window.innerHeight * 0.6, 600);
            
            // 保持宽高比
            const aspectRatio = 800 / 600;
            let width = maxWidth;
            let height = width / aspectRatio;
            
            if (height > maxHeight) {
                height = maxHeight;
                width = height * aspectRatio;
            }
            
            this.renderer.resize(Math.floor(width), Math.floor(height));
        }
    }

    // 检查游戏是否正在进行
    isGameActive() {
        return this.stateManager.isGameActive();
    }

    // 状态变化回调
    onStateChange(eventType, data) {
        switch (eventType) {
            case 'status':
                // 游戏状态改变
                if (data === GAME_CONFIG.GAME_STATUS.WIN || data === GAME_CONFIG.GAME_STATUS.LOSE) {
                    this.showGameOver(data === GAME_CONFIG.GAME_STATUS.WIN);
                }
                break;
            case 'scoreUpdate':
                // 得分更新
                document.getElementById('score').textContent = data;
                break;
            case 'moveUpdate':
                // 移动次数更新
                document.getElementById('moves').textContent = data;
                break;
            case 'levelUpdate':
                // 关卡更新
                document.getElementById('level').textContent = data;
                break;
        }
    }

    // 处理动画队列
    processAnimationQueue() {
        // 这里处理动画队列逻辑
        // 目前简化处理，实际可以实现复杂的动画队列系统
    }

    // 添加动画到队列
    enqueueAnimation(animationPromise) {
        this.animationQueue.push(animationPromise);
        
        // 执行动画并从队列中移除
        animationPromise.finally(() => {
            const index = this.animationQueue.indexOf(animationPromise);
            if (index > -1) {
                this.animationQueue.splice(index, 1);
            }
            this.isAnimating = this.animationQueue.length > 0;
        });
        
        this.isAnimating = true;
    }

    // 清理游戏资源
    destroy() {
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }
        
        this.eventManager.cleanup();
    }

    // 保存游戏进度
    saveGame() {
        this.stateManager.saveGame();
    }

    // 加载游戏进度
    loadGame() {
        return this.stateManager.loadGame();
    }

    // 获取游戏统计
    getStats() {
        return this.stateManager.getStats();
    }
}