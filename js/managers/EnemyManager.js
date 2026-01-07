// 敌机管理器

import { Enemy } from '../entities/Enemy.js';
import { Bullet } from '../entities/Bullet.js';
import { CANVAS_WIDTH, ENEMY_TYPES } from '../config.js';

export class EnemyManager {
    constructor(game) {
        this.game = game;
        this.enemies = [];
        this.enemyBullets = [];
        this.spawnInterval = 2000; // 默认生成间隔
        this.lastSpawnTime = 0;
        this.currentLevel = 1;
    }

    update(deltaTime) {
        const currentTime = Date.now();

        // 生成敌机
        if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
            this.spawnEnemy();
            this.lastSpawnTime = currentTime;
        }

        // 更新敌机
        this.enemies = this.enemies.filter(enemy => {
            enemy.update(deltaTime);
            
            // 敌机射击
            if (enemy.canShoot(currentTime)) {
                const bulletPos = enemy.shoot(currentTime);
                this.enemyBullets.push(new Bullet(bulletPos.x, bulletPos.y, false));
            }
            
            return enemy.active;
        });

        // 更新敌机子弹
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.update(deltaTime);
            return bullet.active;
        });
    }

    render(ctx) {
        this.enemies.forEach(enemy => enemy.render(ctx));
        this.enemyBullets.forEach(bullet => bullet.render(ctx));
    }

    spawnEnemy() {
        const x = Math.random() * (CANVAS_WIDTH - 50);
        const y = -50;
        
        // 根据关卡决定敌机类型
        let type;
        const rand = Math.random();
        
        if (this.currentLevel === 1) {
            type = 'SMALL';
        } else if (this.currentLevel === 2) {
            type = rand < 0.7 ? 'SMALL' : 'MEDIUM';
        } else {
            if (rand < 0.5) {
                type = 'SMALL';
            } else if (rand < 0.8) {
                type = 'MEDIUM';
            } else {
                type = 'LARGE';
            }
        }
        
        this.enemies.push(new Enemy(x, y, type));
    }

    setLevel(level) {
        this.currentLevel = level;
        // 根据关卡调整生成间隔
        this.spawnInterval = Math.max(800, 2000 - level * 200);
    }

    clear() {
        this.enemies = [];
        this.enemyBullets = [];
    }
}
