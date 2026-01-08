/**
 * 游戏核心控制器
 * 负责协调所有游戏模块，处理游戏主逻辑和状态管理
 */
class GameController {
    /**
     * 构造游戏控制器
     */
    constructor() {
        this.levelManager = new LevelManager();   // 关卡管理器
        this.boardManager = new BoardManager();   // 棋盘管理器
        this.scoreManager = new ScoreManager();   // 计分管理器
        this.gameState = new GameStateData();     // 游戏状态数据
        
        this.timer = null;  // 倒计时定时器
        this.ui = null;     // UI组件将在初始化时设置
    }

    /**
     * 初始化游戏
     * 绑定UI并加载游戏进度
     * @param {UIManager} ui - UI管理器实例
     */
    init(ui) {
        this.ui = ui;
        this.levelManager.loadProgress();              // 从本地存储加载进度
        this.gameState.gameState = GameState.NOT_STARTED;  // 设置初始状态
    }

    /**
     * 开始游戏（从第一关开始）
     * 用于从主菜单开始新游戏
     */
    startGame() {
        this.levelManager.setCurrentLevel(1);  // 设置为第一关
        this.startLevel();                     // 开始关卡
    }

    /**
     * 开始指定关卡
     * 用于关卡选择功能
     * @param {number} levelNumber - 关卡编号
     */
    startLevelByNumber(levelNumber) {
        if (this.levelManager.setCurrentLevel(levelNumber)) {
            this.startLevel();  // 如果设置成功，开始该关卡
        }
    }

    /**
     * 开始当前关卡
     * 初始化关卡数据，棋盘和UI，并启动倒计时
     */
    startLevel() {
        const levelConfig = this.levelManager.getCurrentLevel();  // 获取当前关卡配置
        
        // 重置状态
        this.scoreManager.reset();                  // 重置计分系统
        this.gameState.resetForNewLevel();          // 重置游戏状态
        this.gameState.currentLevel = levelConfig.levelNumber;  // 设置当前关卡
        this.gameState.remainingTime = levelConfig.timeLimit;   // 设置时间限制
        this.gameState.gameState = GameState.PLAYING;          // 设置为游戏中状态
        
        // 初始化棋盘
        this.boardManager.initBoard(levelConfig);
        
        // 更新UI
        this.ui.showGameScreen();                          // 显示游戏界面
        this.ui.updateLevelInfo(levelConfig.levelNumber);  // 更新关卡信息
        this.ui.updateScore(0);                            // 重置分数显示
        this.ui.updateCombo(0);                            // 重置连击显示
        this.ui.updateTime(levelConfig.timeLimit);         // 设置时间显示
        this.ui.renderBoard(this.boardManager.getBoard()); // 渲染棋盘
        
        // 启动倒计时
        this.startTimer();
    }

    /**
     * 启动倒计时
     * 每秒更新一次时间，检查连击和时间耗尽
     */
    startTimer() {
        this.stopTimer();  // 先停止之前的定时器
        this.timer = setInterval(() => {
            if (this.gameState.gameState === GameState.PLAYING) {
                this.gameState.remainingTime--;              // 时间减1
                this.ui.updateTime(this.gameState.remainingTime);  // 更新UI
                
                // 检查连击是否过期
                if (this.scoreManager.checkComboExpired()) {
                    this.ui.updateCombo(0);  // 重置连击显示
                }
                
                // 时间耗尽
                if (this.gameState.remainingTime <= 0) {
                    this.gameFailed();  // 游戏失败
                }
            }
        }, 1000);  // 每秒执行一次
    }

    /**
     * 停止倒计时
     * 清除定时器
     */
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);  // 清除定时器
            this.timer = null;
        }
    }

    /**
     * 处理方块点击
     * 处理玩家点击方块的事件，包括选中、消除和分数计算
     * @param {number} row - 被点击方块的行索引
     * @param {number} col - 被点击方块的列索引
     */
    handleTileClick(row, col) {
        // 只在游戏进行中才处理点击
        if (this.gameState.gameState !== GameState.PLAYING) {
            return;
        }

        const result = this.boardManager.selectTile(row, col);  // 调用棋盘管理器处理选择
        
        if (!result) return;  // 如果没有结果，直接返回

        // 根据不同的操作类型执行相应逻辑
        switch (result.action) {
            case 'select':   // 选中方块
                this.ui.renderBoard(this.boardManager.getBoard());
                break;
                
            case 'deselect':  // 取消选中
                this.ui.renderBoard(this.boardManager.getBoard());
                break;
                
            case 'switch':   // 切换选中
                this.ui.renderBoard(this.boardManager.getBoard());
                break;
                
            case 'match':    // 匹配成功
                // 显示路径动画
                this.ui.showPathAnimation(result.path, () => {
                    // 动画完成后执行消除
                    this.boardManager.removeTiles(result.tiles);  // 消除方块
                    
                    // 更新分数
                    const scoreResult = this.scoreManager.recordRemove();  // 记录消除并计分
                    this.ui.updateScore(this.scoreManager.getCurrentScore());  // 更新分数显示
                    this.ui.updateCombo(scoreResult.combo);                   // 更新连击显示
                    
                    // 重新渲染
                    this.ui.renderBoard(this.boardManager.getBoard());
                    
                    // 检查是否完成
                    if (this.boardManager.isComplete()) {
                        this.levelComplete();  // 关卡完成
                    }
                });
                break;
        }
    }

    /**
     * 关卡完成
     * 计算总分（包括时间奖励）并显示胜利界面
     */
    levelComplete() {
        this.stopTimer();  // 停止倒计时
        this.gameState.gameState = GameState.VICTORY;  // 设置为胜利状态
        
        const timeBonus = this.scoreManager.calculateTimeBonus(this.gameState.remainingTime);  // 计算时间奖励
        const totalScore = this.scoreManager.getCurrentScore() + timeBonus;  // 计算总分
        this.gameState.totalScore += totalScore;  // 累加到总分
        
        // 显示胜利界面
        this.ui.showVictoryModal(
            this.scoreManager.getCurrentScore(),  // 关卡分数
            timeBonus,                            // 时间奖励
            totalScore,                           // 总分
            this.levelManager.isLastLevel()       // 是否为最后一关
        );
    }

    /**
     * 游戏失败
     * 停止游戏并显示失败界面
     */
    gameFailed() {
        this.stopTimer();  // 停止倒计时
        this.gameState.gameState = GameState.FAILURE;  // 设置为失败状态
        
        this.ui.showFailureModal(this.scoreManager.getCurrentScore());  // 显示失败弹窗
    }

    /**
     * 进入下一关
     * 尝试进入下一关，如果已是最后一关则显示通关界面
     */
    nextLevel() {
        if (this.levelManager.nextLevel()) {
            this.startLevel();  // 进入下一关
        } else {
            // 全部通关
            this.ui.showCompleteModal(this.gameState.totalScore);  // 显示通关界面
        }
    }

    /**
     * 重新开始当前关卡
     * 重新初始化当前关卡
     */
    restartLevel() {
        this.startLevel();
    }

    /**
     * 暂停游戏
     * 将游戏设置为暂停状态并显示暂停菜单
     */
    pauseGame() {
        if (this.gameState.gameState === GameState.PLAYING) {
            this.gameState.gameState = GameState.PAUSED;  // 设置为暂停状态
            this.ui.showPauseModal();                     // 显示暂停弹窗
        }
    }

    /**
     * 继续游戏
     * 从暂停状态恢复游戏
     */
    resumeGame() {
        if (this.gameState.gameState === GameState.PAUSED) {
            this.gameState.gameState = GameState.PLAYING;  // 恢复为游戏中状态
            this.ui.hidePauseModal();                      // 隐藏暂停弹窗
        }
    }

    /**
     * 返回主菜单
     * 停止当前游戏并返回主菜单
     */
    returnToMenu() {
        this.stopTimer();                              // 停止倒计时
        this.gameState.gameState = GameState.NOT_STARTED;  // 重置游戏状态
        this.gameState.totalScore = 0;                  // 清空总分
        this.ui.showMainMenu();                        // 显示主菜单
    }

    /**
     * 获取最大解锁关卡
     * @returns {number} 返回玩家已解锁的最大关卡编号
     */
    getMaxUnlockedLevel() {
        return this.levelManager.maxUnlockedLevel;
    }

    /**
     * 获取总关卡数
     * @returns {number} 返回游戏的总关卡数
     */
    getTotalLevels() {
        return this.levelManager.getTotalLevels();
    }
}
