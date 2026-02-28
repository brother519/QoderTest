import { LEVELS } from './levels.js';
import { ENEMY_TYPE } from '../utils/Constants.js';

// 关卡管理器
export class LevelManager {
    constructor() {
        this.levels = LEVELS;
        this.totalLevels = LEVELS.length;
    }

    // 获取关卡数据
    getLevel(levelNum) {
        const index = Math.min(levelNum - 1, this.levels.length - 1);
        const levelData = this.levels[index];
        
        // 如果超出关卡数，增加难度
        if (levelNum > this.levels.length) {
            return this.createHarderLevel(levelData, levelNum);
        }
        
        return {
            ...levelData,
            // 深拷贝地图数据，避免修改原始数据
            mapData: levelData.mapData.map(row => [...row]),
            getEnemyType: (index) => this.getEnemyTypeForLevel(levelData, index)
        };
    }

    // 根据索引获取敌人类型
    getEnemyTypeForLevel(levelData, index) {
        let count = 0;
        for (const enemyConfig of levelData.enemyTypes) {
            count += enemyConfig.count;
            if (index < count) {
                return enemyConfig.type;
            }
        }
        return ENEMY_TYPE.NORMAL;
    }

    // 创建更难的关卡(循环关卡时)
    createHarderLevel(baseLevelData, levelNum) {
        const difficulty = levelNum - this.levels.length;
        
        return {
            ...baseLevelData,
            mapData: baseLevelData.mapData.map(row => [...row]),
            totalEnemies: baseLevelData.totalEnemies + difficulty * 2,
            spawnInterval: Math.max(1500, baseLevelData.spawnInterval - difficulty * 100),
            maxOnScreen: Math.min(8, baseLevelData.maxOnScreen + Math.floor(difficulty / 2)),
            getEnemyType: (index) => {
                // 更多装甲坦克
                if (index % 3 === 0) return ENEMY_TYPE.ARMORED;
                if (index % 2 === 0) return ENEMY_TYPE.FAST;
                return ENEMY_TYPE.NORMAL;
            }
        };
    }
}
