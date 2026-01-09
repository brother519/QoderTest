// 敌方坦克生成管理器
class SpawnManager {
    constructor() {
        this.totalEnemies = Constants.ENEMIES_PER_LEVEL;
        this.spawnedEnemies = 0;
        this.activeEnemies = [];
        this.maxActiveEnemies = Constants.MAX_ENEMIES_ON_SCREEN;
        this.spawnPoints = Constants.SPAWN_POINTS;
        this.currentSpawnPoint = 0;
        this.lastSpawnTime = Date.now();
        this.spawnCooldown = Constants.ENEMY_SPAWN_COOLDOWN;
    }
    
    /**
     * 重置生成管理器
     */
    reset() {
        this.spawnedEnemies = 0;
        this.activeEnemies = [];
        this.currentSpawnPoint = 0;
        this.lastSpawnTime = Date.now();
    }
    
    /**
     * 尝试生成敌人
     */
    trySpawn() {
        const currentTime = Date.now();
        
        // 检查是否可以生成
        if (this.spawnedEnemies >= this.totalEnemies) {
            return null;
        }
        
        if (this.activeEnemies.length >= this.maxActiveEnemies) {
            return null;
        }
        
        if (currentTime - this.lastSpawnTime < this.spawnCooldown) {
            return null;
        }
        
        // 生成新敌人
        const spawnPoint = this.spawnPoints[this.currentSpawnPoint];
        const enemyType = this.getEnemyType();
        const enemy = new EnemyTank(spawnPoint.x, spawnPoint.y, enemyType);
        
        this.activeEnemies.push(enemy);
        this.spawnedEnemies++;
        this.lastSpawnTime = currentTime;
        
        // 轮换生成点
        this.currentSpawnPoint = (this.currentSpawnPoint + 1) % this.spawnPoints.length;
        
        return enemy;
    }
    
    /**
     * 获取敌人类型
     */
    getEnemyType() {
        // 根据已生成数量决定敌人类型
        const rand = Math.random();
        
        if (this.spawnedEnemies % 5 === 0 && this.spawnedEnemies > 0) {
            // 每5个敌人出现一个奖励坦克
            return Constants.TANK_TYPE.ENEMY_BONUS;
        } else if (rand < 0.6) {
            return Constants.TANK_TYPE.ENEMY_NORMAL;
        } else if (rand < 0.85) {
            return Constants.TANK_TYPE.ENEMY_FAST;
        } else {
            return Constants.TANK_TYPE.ENEMY_ARMOR;
        }
    }
    
    /**
     * 移除死亡的敌人
     */
    removeDeadEnemy(enemy) {
        const index = this.activeEnemies.indexOf(enemy);
        if (index > -1) {
            this.activeEnemies.splice(index, 1);
        }
    }
    
    /**
     * 获取剩余敌人数量
     */
    getRemainingEnemies() {
        return this.totalEnemies - this.spawnedEnemies;
    }
    
    /**
     * 检查是否所有敌人都被消灭
     */
    isAllEnemiesDefeated() {
        return this.spawnedEnemies >= this.totalEnemies && this.activeEnemies.length === 0;
    }
    
    /**
     * 获取活跃敌人列表
     */
    getActiveEnemies() {
        return this.activeEnemies;
    }
}
