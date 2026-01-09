// 游戏状态管理器
class GameStateManager {
    constructor() {
        this.currentState = Constants.GAME_STATE.MENU;
        this.currentLevel = 1;
    }
    
    /**
     * 切换游戏状态
     */
    setState(newState) {
        this.currentState = newState;
    }
    
    /**
     * 获取当前状态
     */
    getState() {
        return this.currentState;
    }
    
    /**
     * 检查是否在游戏中
     */
    isPlaying() {
        return this.currentState === Constants.GAME_STATE.PLAYING;
    }
    
    /**
     * 检查是否暂停
     */
    isPaused() {
        return this.currentState === Constants.GAME_STATE.PAUSED;
    }
    
    /**
     * 切换暂停状态
     */
    togglePause() {
        if (this.currentState === Constants.GAME_STATE.PLAYING) {
            this.currentState = Constants.GAME_STATE.PAUSED;
        } else if (this.currentState === Constants.GAME_STATE.PAUSED) {
            this.currentState = Constants.GAME_STATE.PLAYING;
        }
    }
    
    /**
     * 开始游戏
     */
    startGame() {
        this.currentState = Constants.GAME_STATE.PLAYING;
        this.currentLevel = 1;
    }
    
    /**
     * 游戏结束
     */
    gameOver() {
        this.currentState = Constants.GAME_STATE.GAME_OVER;
    }
    
    /**
     * 胜利
     */
    victory() {
        this.currentState = Constants.GAME_STATE.VICTORY;
    }
    
    /**
     * 下一关
     */
    nextLevel() {
        this.currentLevel++;
        this.currentState = Constants.GAME_STATE.PLAYING;
    }
    
    /**
     * 重新开始
     */
    restart() {
        this.currentLevel = 1;
        this.currentState = Constants.GAME_STATE.PLAYING;
    }
}
