import { CONFIG } from '../config.js';
import { random, randomChoice, getDistance } from '../utils/helpers.js';

export class AISystem {
    constructor(collisionSystem, obstacles, base, player) {
        this.collisionSystem = collisionSystem;
        this.obstacles = obstacles;
        this.base = base;
        this.player = player;
    }

    updateEnemy(enemy) {
        if (enemy.aiTimer >= enemy.aiUpdateInterval) {
            enemy.aiTimer = 0;
            this.makeDecision(enemy);
        }

        if (enemy.currentAction === 'move') {
            this.moveEnemy(enemy);
        } else if (enemy.currentAction === 'attack') {
            return enemy.shoot();
        }
        
        return null;
    }

    makeDecision(enemy) {
        if (Math.random() < 0.3) {
            enemy.currentAction = 'move';
            enemy.direction = random(0, 3);
        } else {
            const distanceToBase = this.base ? getDistance(
                enemy.x, enemy.y,
                this.base.x, this.base.y
            ) : Infinity;
            
            const distanceToPlayer = this.player ? getDistance(
                enemy.x, enemy.y,
                this.player.x, this.player.y
            ) : Infinity;

            if (distanceToBase < 320 || distanceToPlayer < 256) {
                if (enemy.canShoot()) {
                    enemy.currentAction = 'attack';
                    this.aimAt(enemy, distanceToBase < distanceToPlayer ? this.base : this.player);
                } else {
                    enemy.currentAction = 'move';
                }
            } else {
                enemy.currentAction = 'move';
            }
        }
    }

    aimAt(enemy, target) {
        const dx = target.x - enemy.x;
        const dy = target.y - enemy.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            enemy.direction = dx > 0 ? CONFIG.DIRECTION.RIGHT : CONFIG.DIRECTION.LEFT;
        } else {
            enemy.direction = dy > 0 ? CONFIG.DIRECTION.DOWN : CONFIG.DIRECTION.UP;
        }
    }

    moveEnemy(enemy) {
        const oldX = enemy.x;
        const oldY = enemy.y;
        
        let dx = 0, dy = 0;
        switch (enemy.direction) {
            case CONFIG.DIRECTION.UP:
                dy = -enemy.speed;
                break;
            case CONFIG.DIRECTION.DOWN:
                dy = enemy.speed;
                break;
            case CONFIG.DIRECTION.LEFT:
                dx = -enemy.speed;
                break;
            case CONFIG.DIRECTION.RIGHT:
                dx = enemy.speed;
                break;
        }
        
        enemy.move(dx, dy);
        
        let collision = false;
        for (const obstacle of this.obstacles) {
            if (this.collisionSystem.checkTankVsObstacle(enemy, oldX, oldY, obstacle)) {
                collision = true;
                break;
            }
        }
        
        if (collision) {
            enemy.direction = random(0, 3);
        }
    }
}
