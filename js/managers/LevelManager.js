// 关卡管理器

import { LEVEL_CONFIG } from '../config.js';

export class LevelManager {
    constructor(game) {
        this.game = game;
        this.currentLevel = 1;
        this.currentScore = 0;
        this.bossActive = false;
    }

    update(deltaTime) {
        // 更新当前分数
        this.currentScore = this.game.score;

        // 检查是否达到下一关卡条件
        const currentLevelConfig = this.getLevelConfig();
        if (currentLevelConfig && this.currentScore >= currentLevelConfig.scoreThreshold) {
            this.advanceLevel();
        }
    }

    advanceLevel() {
        const nextLevel = this.currentLevel + 1;
        const nextLevelConfig = this.getLevelConfig(nextLevel);
        
        if (nextLevelConfig) {
            this.currentLevel = nextLevel;
            console.log(`进入关卡 ${this.currentLevel}`);
            
            // 更新敌机管理器的关卡
            if (this.game.enemyManager) {
                this.game.enemyManager.setLevel(this.currentLevel);
            }
            
            // 检查是否是Boss关卡
            if (nextLevelConfig.bossLevel && !this.bossActive) {
                this.triggerBoss();
            }
        }
    }

    getLevelConfig(level = null) {
        const targetLevel = level || this.currentLevel;
        return LEVEL_CONFIG.find(config => config.level === targetLevel) || 
               LEVEL_CONFIG[LEVEL_CONFIG.length - 1]; // 返回最后一个关卡配置作为默认
    }

    triggerBoss() {
        console.log('Boss即将出现!');
        this.bossActive = true;
        // 稍后会在这里生成Boss
        // Boss实现在阶段8
    }

    reset() {
        this.currentLevel = 1;
        this.currentScore = 0;
        this.bossActive = false;
    }
}