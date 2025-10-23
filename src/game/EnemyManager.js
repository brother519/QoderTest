import { CONFIG } from '../config.js';
import { Tank } from '../entities/Tank.js';

/**
 * 敌人管理器
 */
export class EnemyManager {
    constructor(gameScene) {
        this.gameScene = gameScene;
        this.enemies = [];
        this.remainingCount = CONFIG.ENEMY.TOTAL_PER_LEVEL;
        this.spawnTimer = 0;
        this.spawnInterval = CONFIG.ENEMY.SPAWN_INTERVAL;
        this.nextSpawnPoint = 0;
    }
    
    /**
     * 更新敌人
     */
    update(deltaTime) {
        // 生成新敌人
        if (this.enemies.length < CONFIG.ENEMY.MAX_SIMULTANEOUS &&
            this.remainingCount > 0 &&
            this.spawnTimer <= 0) {
            this.spawnEnemy();
            this.spawnTimer = this.spawnInterval;
        }
        
        if (this.spawnTimer > 0) {
            this.spawnTimer--;
        }
        
        // 更新每个敌人
        this.enemies = this.enemies.filter(enemy => {
            if (!enemy.isAlive) {
                return false;
            }
            
            // 更新敌人状态
            enemy.update();
            
            // AI决策
            this.updateEnemyAI(enemy);
            
            return true;
        });
    }
    
    /**
     * 生成敌人
     */
    spawnEnemy() {
        const spawnPoints = CONFIG.SPAWN_POINTS.ENEMY;
        const spawnPoint = spawnPoints[this.nextSpawnPoint];
        this.nextSpawnPoint = (this.nextSpawnPoint + 1) % spawnPoints.length;
        
        // 随机选择敌人类型
        const types = [
            CONFIG.TANK_TYPE.ENEMY_BASIC,
            CONFIG.TANK_TYPE.ENEMY_FAST,
            CONFIG.TANK_TYPE.ENEMY_POWER,
            CONFIG.TANK_TYPE.ENEMY_ARMOR
        ];
        
        const type = types[Math.floor(Math.random() * types.length)];
        
        const enemy = new Tank(
            spawnPoint.x * CONFIG.TILE_SIZE,
            spawnPoint.y * CONFIG.TILE_SIZE,
            type,
            false
        );
        
        // 设置敌人属性
        switch (type) {
            case CONFIG.TANK_TYPE.ENEMY_FAST:
                enemy.speed = 2.5;
                break;
            case CONFIG.TANK_TYPE.ENEMY_POWER:
                enemy.lives = 2;
                break;
            case CONFIG.TANK_TYPE.ENEMY_ARMOR:
                enemy.lives = 4;
                break;
        }
        
        // AI状态
        enemy.aiState = 'patrol';
        enemy.aiTimer = 0;
        enemy.aiDirection = CONFIG.DIRECTION.DOWN;
        
        this.enemies.push(enemy);
        this.remainingCount--;
    }
    
    /**
     * 更新敌人AI
     */
    updateEnemyAI(enemy) {
        enemy.aiTimer++;
        
        // 每隔一段时间做决策
        if (enemy.aiTimer % 60 === 0) {
            this.makeDecision(enemy);
        }
        
        // 执行移动
        enemy.move(enemy.aiDirection, this.gameScene.map, this.gameScene.getAllTanks());
        
        // 随机射击
        if (Math.random() < 0.02) {
            const bullet = enemy.shoot();
            if (bullet) {
                this.gameScene.bullets.push(bullet);
                // 敌人射击音效音量较低
                this.gameScene.engine.audioManager.playSound('shoot', 0.15);
            }
        }
    }
    
    /**
     * AI决策
     */
    makeDecision(enemy) {
        // 简单AI：随机选择方向
        const rand = Math.random();
        
        if (rand < 0.3) {
            // 30%概率朝向基地
            const baseX = CONFIG.SPAWN_POINTS.BASE_POSITION.x * CONFIG.TILE_SIZE;
            const baseY = CONFIG.SPAWN_POINTS.BASE_POSITION.y * CONFIG.TILE_SIZE;
            
            const dx = baseX - enemy.x;
            const dy = baseY - enemy.y;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                enemy.aiDirection = dx > 0 ? CONFIG.DIRECTION.RIGHT : CONFIG.DIRECTION.LEFT;
            } else {
                enemy.aiDirection = dy > 0 ? CONFIG.DIRECTION.DOWN : CONFIG.DIRECTION.UP;
            }
        } else if (rand < 0.6) {
            // 30%概率朝向最近的玩家
            const players = this.gameScene.players.filter(p => p.isAlive);
            if (players.length > 0) {
                const target = players[0];
                const dx = target.x - enemy.x;
                const dy = target.y - enemy.y;
                
                if (Math.abs(dx) > Math.abs(dy)) {
                    enemy.aiDirection = dx > 0 ? CONFIG.DIRECTION.RIGHT : CONFIG.DIRECTION.LEFT;
                } else {
                    enemy.aiDirection = dy > 0 ? CONFIG.DIRECTION.DOWN : CONFIG.DIRECTION.UP;
                }
            }
        } else {
            // 40%概率随机移动
            enemy.aiDirection = Math.floor(Math.random() * 4);
        }
    }
    
    /**
     * 冻结所有敌人
     */
    freezeAll(duration) {
        this.enemies.forEach(enemy => {
            enemy.freeze(duration);
        });
    }
    
    /**
     * 摧毁所有敌人
     */
    destroyAll() {
        this.enemies.forEach(enemy => {
            enemy.isAlive = false;
            this.gameScene.createExplosion(enemy.x, enemy.y, CONFIG.TANK.SIZE);
            this.gameScene.addScore(CONFIG.SCORE.BASIC_TANK);
        });
        this.enemies = [];
    }
    
    /**
     * 获取剩余敌人数量
     */
    getRemainingCount() {
        return this.remainingCount + this.enemies.length;
    }
    
    /**
     * 检查关卡是否完成
     */
    isLevelComplete() {
        return this.remainingCount === 0 && this.enemies.length === 0;
    }
    
    /**
     * 渲染敌人
     */
    render(renderer, frameCount) {
        this.enemies.forEach(enemy => {
            enemy.render(renderer, frameCount);
        });
    }
}
