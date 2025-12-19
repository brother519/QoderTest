import { Entity } from './entity.js';
import { CONFIG } from '../config.js';

export class Tank extends Entity {
    constructor(x, y, size, speed, health, shootCooldown, color) {
        super(x, y, size, size);
        this.speed = speed;
        this.health = health;
        this.maxHealth = health;
        this.direction = CONFIG.DIRECTION.UP;
        this.shootCooldown = shootCooldown;
        this.lastShotTime = 0;
        this.color = color;
        this.bullets = [];
    }

    move(dx, dy) {
        if (dx !== 0) {
            this.direction = dx > 0 ? CONFIG.DIRECTION.RIGHT : CONFIG.DIRECTION.LEFT;
        } else if (dy !== 0) {
            this.direction = dy < 0 ? CONFIG.DIRECTION.UP : CONFIG.DIRECTION.DOWN;
        }
        
        this.x += dx;
        this.y += dy;
        
        this.x = Math.max(0, Math.min(this.x, CONFIG.CANVAS_WIDTH - this.width));
        this.y = Math.max(0, Math.min(this.y, CONFIG.CANVAS_HEIGHT - this.height));
    }

    canShoot() {
        return Date.now() - this.lastShotTime >= this.shootCooldown;
    }

    shoot() {
        if (!this.canShoot()) return null;
        
        this.lastShotTime = Date.now();
        
        let bulletX = this.x + this.width / 2 - CONFIG.BULLET.SIZE / 2;
        let bulletY = this.y + this.height / 2 - CONFIG.BULLET.SIZE / 2;
        let bulletDx = 0;
        let bulletDy = 0;
        
        switch (this.direction) {
            case CONFIG.DIRECTION.UP:
                bulletY = this.y - CONFIG.BULLET.SIZE;
                bulletDy = -CONFIG.BULLET.SPEED;
                break;
            case CONFIG.DIRECTION.DOWN:
                bulletY = this.y + this.height;
                bulletDy = CONFIG.BULLET.SPEED;
                break;
            case CONFIG.DIRECTION.LEFT:
                bulletX = this.x - CONFIG.BULLET.SIZE;
                bulletDx = -CONFIG.BULLET.SPEED;
                break;
            case CONFIG.DIRECTION.RIGHT:
                bulletX = this.x + this.width;
                bulletDx = CONFIG.BULLET.SPEED;
                break;
        }
        
        return { x: bulletX, y: bulletY, dx: bulletDx, dy: bulletDy, owner: this };
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy();
        }
    }

    update(dt) {
        super.update(dt);
    }

    render(renderer) {
        renderer.drawTank(this.x, this.y, this.width, this.direction, this.color);
    }
}
