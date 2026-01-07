// StateManager.js - 游戏状态管理
class StateManager {
    constructor() {
        this.state = {
            status: GAME_CONFIG.GAME_STATUS.IDLE,  // 游戏状态
            currentLevel: 1,                       // 当前关卡
            score: 0,                             // 得分
            moveCount: 0,                         // 移动次数
            startTime: null,                      // 游戏开始时间
            currentTime: 0,                       // 当前游戏时间
            bestScores: {},                       // 各关卡最佳得分
            bestTimes: {}                         // 各关卡最佳时间
        };
        
        this.observers = []; // 状态变化观察者
    }

    // 获取当前状态
    getState() {
        return { ...this.state };
    }

    // 设置游戏状态
    setStatus(status) {
        this.state.status = status;
        this.notifyObservers('status', status);
    }

    // 获取游戏状态
    getStatus() {
        return this.state.status;
    }

    // 开始游戏
    startGame(levelId = 1) {
        this.state.currentLevel = levelId;
        this.state.score = 0;
        this.state.moveCount = 0;
        this.state.startTime = Date.now();
        this.state.currentTime = 0;
        this.state.status = GAME_CONFIG.GAME_STATUS.PLAYING;
        
        this.notifyObservers('gameStart', { level: levelId });
    }

    // 更新游戏时间
    updateGameTime() {
        if (this.state.startTime) {
            this.state.currentTime = (Date.now() - this.state.startTime) / 1000; // 秒
        }
    }

    // 获取游戏时间
    getGameTime() {
        return this.state.currentTime;
    }

    // 增加得分
    addScore(points) {
        this.state.score += points;
        this.notifyObservers('scoreUpdate', this.state.score);
    }

    // 增加移动次数
    addMove() {
        this.state.moveCount++;
        this.notifyObservers('moveUpdate', this.state.moveCount);
    }

    // 获取当前得分
    getScore() {
        return this.state.score;
    }

    // 获取移动次数
    getMoveCount() {
        return this.state.moveCount;
    }

    // 获取当前关卡
    getCurrentLevel() {
        return this.state.currentLevel;
    }

    // 设置当前关卡
    setCurrentLevel(levelId) {
        this.state.currentLevel = levelId;
        this.notifyObservers('levelUpdate', levelId);
    }

    // 游戏胜利
    winGame() {
        this.state.status = GAME_CONFIG.GAME_STATUS.WIN;
        this.updateGameTime();
        
        // 更新最佳记录
        this.updateBestScore();
        this.updateBestTime();
        
        this.notifyObservers('gameWin', {
            score: this.state.score,
            time: this.state.currentTime,
            moves: this.state.moveCount
        });
    }

    // 游戏失败
    loseGame() {
        this.state.status = GAME_CONFIG.GAME_STATUS.LOSE;
        this.updateGameTime();
        
        this.notifyObservers('gameLose', {
            score: this.state.score,
            time: this.state.currentTime,
            moves: this.state.moveCount
        });
    }

    // 更新最佳得分
    updateBestScore() {
        const level = this.state.currentLevel;
        if (!this.state.bestScores[level] || this.state.score > this.state.bestScores[level]) {
            this.state.bestScores[level] = this.state.score;
        }
    }

    // 更新最佳时间
    updateBestTime() {
        const level = this.state.currentLevel;
        const currentTime = this.state.currentTime;
        if (!this.state.bestTimes[level] || currentTime < this.state.bestTimes[level]) {
            this.state.bestTimes[level] = currentTime;
        }
    }

    // 获取最佳得分
    getBestScore(level) {
        return this.state.bestScores[level] || 0;
    }

    // 获取最佳时间
    getBestTime(level) {
        return this.state.bestTimes[level] || 0;
    }

    // 保存游戏状态到本地存储
    saveGame() {
        try {
            const saveData = {
                state: this.state,
                timestamp: Date.now()
            };
            localStorage.setItem('sheepGameSave', JSON.stringify(saveData));
            this.notifyObservers('gameSaved');
        } catch (e) {
            console.error('Failed to save game:', e);
        }
    }

    // 从本地存储加载游戏状态
    loadGame() {
        try {
            const saveData = localStorage.getItem('sheepGameSave');
            if (saveData) {
                const parsed = JSON.parse(saveData);
                this.state = { ...parsed.state };
                this.notifyObservers('gameLoaded', this.state);
                return true;
            }
            return false;
        } catch (e) {
            console.error('Failed to load game:', e);
            return false;
        }
    }

    // 重置当前游戏
    resetGame() {
        this.state.score = 0;
        this.state.moveCount = 0;
        this.state.startTime = null;
        this.state.currentTime = 0;
        this.state.status = GAME_CONFIG.GAME_STATUS.IDLE;
        
        this.notifyObservers('gameReset');
    }

    // 添加状态变化观察者
    addObserver(callback) {
        this.observers.push(callback);
    }

    // 移除状态变化观察者
    removeObserver(callback) {
        const index = this.observers.indexOf(callback);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    // 通知所有观察者状态变化
    notifyObservers(eventType, data) {
        for (const observer of this.observers) {
            try {
                observer(eventType, data);
            } catch (e) {
                console.error('Error in state observer:', e);
            }
        }
    }

    // 暂停游戏
    pauseGame() {
        if (this.state.status === GAME_CONFIG.GAME_STATUS.PLAYING) {
            this.state.status = GAME_CONFIG.GAME_STATUS.PAUSED;
            this.notifyObservers('gamePaused');
        }
    }

    // 恢复游戏
    resumeGame() {
        if (this.state.status === GAME_CONFIG.GAME_STATUS.PAUSED) {
            this.state.status = GAME_CONFIG.GAME_STATUS.PLAYING;
            this.state.startTime = Date.now() - this.state.currentTime * 1000;
            this.notifyObservers('gameResumed');
        }
    }

    // 检查游戏是否在进行中
    isGameActive() {
        return this.state.status === GAME_CONFIG.GAME_STATUS.PLAYING;
    }

    // 检查游戏是否结束
    isGameOver() {
        return this.state.status === GAME_CONFIG.GAME_STATUS.WIN || 
               this.state.status === GAME_CONFIG.GAME_STATUS.LOSE;
    }

    // 获取游戏统计信息
    getStats() {
        return {
            score: this.state.score,
            moves: this.state.moveCount,
            time: this.state.currentTime,
            level: this.state.currentLevel
        };
    }
}

// 全局状态管理实例
const stateManager = new StateManager();