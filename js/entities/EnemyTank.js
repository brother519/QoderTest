import { Tank } from './Tank.js';
import { COLORS, DIRECTIONS, MAX_ENEMY_BULLETS, TANK_SPEED } from '../constants.js';
import { AIController } from '../ai/AIController.js';

export class EnemyTank extends Tank {
    constructor(game, x, y, enemyType = 'basic') {
        super(game, x, y, 'enemy');
        this.enemyType = enemyType;
        this.ai = new AIController(this, game);
        this.maxBullets = MAX_ENEMY_BULLETS;
        this.points = 100;
        
        this.setupByType(enemyType);
    }
    
    setupByType(type) {
        switch (type) {
            case 'basic':
                this.color = COLORS.ENEMY_BASIC;
                this.speed = TANK_SPEED * 0.8;
                this.health = 1;
                this.points = 100;
                break;
            case 'fast':
                this.color = COLORS.ENEMY_FAST;
                this.speed = TANK_SPEED * 1.3;
                this.health = 1;
                this.points = 200;
                break;
            case 'power':
                this.color = COLORS.ENEMY_POWER;
                this.speed = TANK_SPEED;
                this.health = 1;
                this.bulletSpeed = 400;
                this.fireCooldown = 300;
                this.points = 300;
                break;
            case 'armor':
                this.color = COLORS.ENEMY_ARMOR;
                this.speed = TANK_SPEED * 0.7;
                this.health = 4;
                this.maxHealth = 4;
                this.points = 400;
                break;
        }
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        if (!this.isAlive) return;
        
        this.ai.update(deltaTime);
    }
    
    destroy() {
        if (!this.isAlive) return;
        
        super.destroy();
        
        this.game.eventBus.emit('enemyDestroyed', {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            points: this.points,
            type: this.enemyType
        });
    }
    
    render(ctx) {
        super.render(ctx);
        
        if (this.enemyType === 'armor' && this.health > 1) {
            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(this.x, this.y - 6, this.width * healthPercent, 3);
            ctx.strokeStyle = '#1e8449';
            ctx.strokeRect(this.x, this.y - 6, this.width, 3);
        }
    }
}
