// 游戏核心控制器
class GameController {
    constructor() {
        this.levelManager = new LevelManager();
        this.boardManager = new BoardManager();
        this.scoreManager = new ScoreManager();
        this.gameState = new GameStateData();
        
        this.timer = null;
        this.ui = null; // UI组件将在初始化时设置
    }

    // 初始化游戏
    init(ui) {
        this.ui = ui;
        this.levelManager.loadProgress();
        this.gameState.gameState = GameState.NOT_STARTED;
    }

    // 开始游戏(从第一关开始)
    startGame() {
        this.levelManager.setCurrentLevel(1);
        this.startLevel();
    }

    // 开始指定关卡
    startLevelByNumber(levelNumber) {
        if (this.levelManager.setCurrentLevel(levelNumber)) {
            this.startLevel();
        }
    }

    // 开始当前关卡
    startLevel() {
        const levelConfig = this.levelManager.getCurrentLevel();
        
        // 重置状态
        this.scoreManager.reset();
        this.gameState.resetForNewLevel();
        this.gameState.currentLevel = levelConfig.levelNumber;
        this.gameState.remainingTime = levelConfig.timeLimit;
        this.gameState.gameState = GameState.PLAYING;
        
        // 初始化棋盘
        this.boardManager.initBoard(levelConfig);
        
        // 更新UI
        this.ui.showGameScreen();
        this.ui.updateLevelInfo(levelConfig.levelNumber);
        this.ui.updateScore(0);
        this.ui.updateCombo(0);
        this.ui.updateTime(levelConfig.timeLimit);
        this.ui.renderBoard(this.boardManager.getBoard());
        
        // 启动倒计时
        this.startTimer();
    }

    // 启动倒计时
    startTimer() {
        this.stopTimer();
        this.timer = setInterval(() => {
            if (this.gameState.gameState === GameState.PLAYING) {
                this.gameState.remainingTime--;
                this.ui.updateTime(this.gameState.remainingTime);
                
                // 检查连击是否过期
                if (this.scoreManager.checkComboExpired()) {
                    this.ui.updateCombo(0);
                }
                
                // 时间耗尽
                if (this.gameState.remainingTime <= 0) {
                    this.gameFailed();
                }
            }
        }, 1000);
    }

    // 停止倒计时
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    // 处理方块点击
    handleTileClick(row, col) {
        if (this.gameState.gameState !== GameState.PLAYING) {
            return;
        }

        const result = this.boardManager.selectTile(row, col);
        
        if (!result) return;

        switch (result.action) {
            case 'select':
                this.ui.renderBoard(this.boardManager.getBoard());
                break;
                
            case 'deselect':
                this.ui.renderBoard(this.boardManager.getBoard());
                break;
                
            case 'switch':
                this.ui.renderBoard(this.boardManager.getBoard());
                break;
                
            case 'match':
                // 显示路径动画
                this.ui.showPathAnimation(result.path, () => {
                    // 动画完成后执行消除
                    this.boardManager.removeTiles(result.tiles);
                    
                    // 更新分数
                    const scoreResult = this.scoreManager.recordRemove();
                    this.ui.updateScore(this.scoreManager.getCurrentScore());
                    this.ui.updateCombo(scoreResult.combo);
                    
                    // 重新渲染
                    this.ui.renderBoard(this.boardManager.getBoard());
                    
                    // 检查是否完成
                    if (this.boardManager.isComplete()) {
                        this.levelComplete();
                    }
                });
                break;
        }
    }

    // 关卡完成
    levelComplete() {
        this.stopTimer();
        this.gameState.gameState = GameState.VICTORY;
        
        const timeBonus = this.scoreManager.calculateTimeBonus(this.gameState.remainingTime);
        const totalScore = this.scoreManager.getCurrentScore() + timeBonus;
        this.gameState.totalScore += totalScore;
        
        // 显示胜利界面
        this.ui.showVictoryModal(
            this.scoreManager.getCurrentScore(),
            timeBonus,
            totalScore,
            this.levelManager.isLastLevel()
        );
    }

    // 游戏失败
    gameFailed() {
        this.stopTimer();
        this.gameState.gameState = GameState.FAILURE;
        
        this.ui.showFailureModal(this.scoreManager.getCurrentScore());
    }

    // 进入下一关
    nextLevel() {
        if (this.levelManager.nextLevel()) {
            this.startLevel();
        } else {
            // 全部通关
            this.ui.showCompleteModal(this.gameState.totalScore);
        }
    }

    // 重新开始当前关卡
    restartLevel() {
        this.startLevel();
    }

    // 暂停游戏
    pauseGame() {
        if (this.gameState.gameState === GameState.PLAYING) {
            this.gameState.gameState = GameState.PAUSED;
            this.ui.showPauseModal();
        }
    }

    // 继续游戏
    resumeGame() {
        if (this.gameState.gameState === GameState.PAUSED) {
            this.gameState.gameState = GameState.PLAYING;
            this.ui.hidePauseModal();
        }
    }

    // 返回主菜单
    returnToMenu() {
        this.stopTimer();
        this.gameState.gameState = GameState.NOT_STARTED;
        this.gameState.totalScore = 0;
        this.ui.showMainMenu();
    }

    // 获取最大解锁关卡
    getMaxUnlockedLevel() {
        return this.levelManager.maxUnlockedLevel;
    }

    // 获取总关卡数
    getTotalLevels() {
        return this.levelManager.getTotalLevels();
    }
}
