// 分数管理器
class ScoreManager {
    constructor() {
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.enemiesKilled = 0;
    }
    
    /**
     * 增加分数
     */
    addScore(points) {
        this.score += points;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
    }
    
    /**
     * 击毁敌人
     */
    enemyKilled(enemyType) {
        this.enemiesKilled++;
        
        // 根据敌人类型增加分数
        let points = 0;
        switch(enemyType) {
            case Constants.TANK_TYPE.ENEMY_FAST:
                points = Constants.SCORES.ENEMY_FAST;
                break;
            case Constants.TANK_TYPE.ENEMY_ARMOR:
                points = Constants.SCORES.ENEMY_ARMOR;
                break;
            case Constants.TANK_TYPE.ENEMY_BONUS:
                points = Constants.SCORES.ENEMY_BONUS;
                break;
            default:
                points = Constants.SCORES.ENEMY_NORMAL;
        }
        
        this.addScore(points);
    }
    
    /**
     * 重置分数
     */
    reset() {
        this.score = 0;
        this.enemiesKilled = 0;
    }
    
    /**
     * 获取当前分数
     */
    getScore() {
        return this.score;
    }
    
    /**
     * 获取最高分
     */
    getHighScore() {
        return this.highScore;
    }
    
    /**
     * 加载最高分（从localStorage）
     */
    loadHighScore() {
        try {
            const saved = localStorage.getItem('tankBattle_highScore');
            return saved ? parseInt(saved) : 0;
        } catch (e) {
            return 0;
        }
    }
    
    /**
     * 保存最高分（到localStorage）
     */
    saveHighScore() {
        try {
            localStorage.setItem('tankBattle_highScore', this.highScore.toString());
        } catch (e) {
            // 无法保存
        }
    }
}
