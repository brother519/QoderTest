import { LevelData } from './levelData.js';
import { Constants } from '../utils/Constants.js';

// 关卡管理器
export class LevelManager {
    constructor() {
        this.currentLevelIndex = 0;
        this.levels = LevelData;
        this.currentLevel = null;
        this.enemiesSpawned = 0;
        this.enemyTypeIndex = 0;
        this.enemyTypeCount = 0;
        this.spawnTimer = 0;
        this.spawnPointIndex = 0;
    }
    
    loadLevel(levelIndex) {
        if (levelIndex >= this.levels.length) {
            return null; // 所有关卡完成
        }
        
        this.currentLevelIndex = levelIndex;
        this.currentLevel = this.levels[levelIndex];
        this.enemiesSpawned = 0;
        this.enemyTypeIndex = 0;
        this.enemyTypeCount = 0;
        this.spawnTimer = 0;
        this.spawnPointIndex = 0;
        
        return this.currentLevel;
    }
    
    getCurrentLevel() {
        return this.currentLevel;
    }
    
    getTotalEnemies() {
        return this.currentLevel ? this.currentLevel.enemyCount : 0;
    }
    
    getEnemiesRemaining() {
        return this.getTotalEnemies() - this.enemiesSpawned;
    }
    
    getNextSpawnPoint() {
        if (!this.currentLevel) return null;
        
        const spawnPoints = this.currentLevel.spawnPoints;
        const point = spawnPoints[this.spawnPointIndex];
        this.spawnPointIndex = (this.spawnPointIndex + 1) % spawnPoints.length;
        
        return point;
    }
    
    getNextEnemyType() {
        if (!this.currentLevel) return 'NORMAL';
        
        const enemyTypes = this.currentLevel.enemyTypes;
        
        // 找到当前类型
        while (this.enemyTypeIndex < enemyTypes.length) {
            const typeConfig = enemyTypes[this.enemyTypeIndex];
            if (this.enemyTypeCount < typeConfig.count) {
                this.enemyTypeCount++;
                return typeConfig.type;
            }
            this.enemyTypeIndex++;
            this.enemyTypeCount = 0;
        }
        
        return 'NORMAL';
    }
    
    shouldSpawnEnemy(currentEnemiesOnScreen, deltaTime) {
        if (!this.currentLevel) return false;
        if (this.enemiesSpawned >= this.currentLevel.enemyCount) return false;
        if (currentEnemiesOnScreen >= Constants.MAX_ENEMIES_ON_SCREEN) return false;
        
        this.spawnTimer += deltaTime;
        
        if (this.spawnTimer >= Constants.ENEMY_SPAWN_DELAY) {
            this.spawnTimer = 0;
            return true;
        }
        
        // 第一个敌人立即生成
        if (this.enemiesSpawned === 0 && currentEnemiesOnScreen === 0) {
            return true;
        }
        
        return false;
    }
    
    onEnemySpawned() {
        this.enemiesSpawned++;
    }
    
    isLevelComplete(enemiesKilled) {
        return this.currentLevel && 
               enemiesKilled >= this.currentLevel.enemyCount;
    }
    
    hasNextLevel() {
        return this.currentLevelIndex + 1 < this.levels.length;
    }
    
    nextLevel() {
        return this.loadLevel(this.currentLevelIndex + 1);
    }
    
    getPlayerSpawnPoint() {
        if (!this.currentLevel) return { x: 192, y: 384 };
        return this.currentLevel.playerSpawn;
    }
    
    getBasePosition() {
        if (!this.currentLevel) return { x: 192, y: 384 };
        
        // 从地图数据中找到基地位置
        const map = this.currentLevel.map;
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if (map[y][x] === Constants.TILE_TYPE.BASE) {
                    return {
                        x: x * Constants.TILE_SIZE,
                        y: y * Constants.TILE_SIZE
                    };
                }
            }
        }
        
        return this.currentLevel.basePosition || { x: 192, y: 384 };
    }
}
