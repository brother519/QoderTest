import { Entity } from './Entity.js';
import { TANK_SIZE, TANK_SPEED, FIRE_COOLDOWN, DIRECTIONS, DIRECTION_VECTORS, COLORS, TILE_SIZE, HALF_TILE } from '../constants.js';
import { Bullet } from './Bullet.js';
import { Explosion } from './Explosion.js';
import { alignToGrid } from '../utils.js';

export class Tank extends Entity {
    constructor(game, x, y, type = 'player') {
        super(x, y, TANK_SIZE, TANK_SIZE);
        this.game = game;
        this.type = type;
        this.speed = TANK_SPEED;
        this.direction = DIRECTIONS.UP;
        
        this.health = 1;
        this.maxHealth = 1;
        
        this.fireCooldown = FIRE_COOLDOWN;
        this.lastFireTime = 0;
        this.bulletSpeed = 300;
        this.bulletDamage = 1;
        this.maxBullets = 1;
        this.activeBullets = 0;
        
        this.isShielded = false;
        this.shieldEndTime = 0;
        this.isPowered = false;
        this.powerEndTime = 0;
        this.speedMultiplier = 1;
        this.speedEndTime = 0;
        
        this.color = COLORS.PLAYER_TANK;
    }
    
    update(deltaTime) {
        if (!this.isAlive) return;
        
        const now = performance.now();
        if (this.isShielded && now > this.shieldEndTime) {
            this.isShielded = false;
        }
        if (this.isPowered && now > this.powerEndTime) {
            this.isPowered = false;
        }
        if (this.speedMultiplier > 1 && now > this.speedEndTime) {
            this.speedMultiplier = 1;
        }
    }
    
    move(direction, deltaTime) {
        if (!this.isAlive) return false;
        
        const oldX = this.x;
        const oldY = this.y;
        const oldDirection = this.direction;
        
        if (direction !== this.direction) {
            if (direction === DIRECTIONS.UP || direction === DIRECTIONS.DOWN) {
                this.x = alignToGrid(this.x, HALF_TILE);
            } else {
                this.y = alignToGrid(this.y, HALF_TILE);
            }
        }
        
        this.direction = direction;
        const vector = DIRECTION_VECTORS[direction];
        const distance = this.speed * this.speedMultiplier * (deltaTime / 1000);
        
        this.x += vector.x * distance;
        this.y += vector.y * distance;
        
        this.x = Math.max(0, Math.min(this.game.canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(this.game.canvas.height - this.height, this.y));
        
        if (this.game.collision.checkTankMapCollision(this)) {
            this.x = oldX;
            this.y = oldY;
            return false;
        }
        
        if (this.game.collision.checkTankTankCollision(this)) {
            this.x = oldX;
            this.y = oldY;
            return false;
        }
        
        return true;
    }
    
    fire() {
        if (!this.isAlive) return null;
        
        const now = performance.now();
        if (now - this.lastFireTime < this.fireCooldown) {
            return null;
        }
        
        if (this.activeBullets >= this.maxBullets) {
            return null;
        }
        
        this.lastFireTime = now;
        this.activeBullets++;
        
        const center = this.getCenter();
        const vector = DIRECTION_VECTORS[this.direction];
        
        const bulletX = center.x + vector.x * (this.width / 2 + 2) - 3;
        const bulletY = center.y + vector.y * (this.height / 2 + 2) - 3;
        
        const bullet = new Bullet(
            this.game,
            bulletX,
            bulletY,
            this.direction,
            this,
            this.isPowered
        );
        
        this.game.addBullet(bullet);
        this.game.audio.play('fire');
        
        return bullet;
    }
    
    onBulletDestroyed() {
        this.activeBullets = Math.max(0, this.activeBullets - 1);
    }
    
    takeDamage(amount = 1) {
        if (!this.isAlive) return;
        if (this.isShielded) return;
        
        this.health -= amount;
        if (this.health <= 0) {
            this.destroy();
        }
    }
    
    destroy() {
        if (!this.isAlive) return;
        
        this.isAlive = false;
        
        const center = this.getCenter();
        const explosion = new Explosion(this.game, center.x, center.y, 'large');
        this.game.addExplosion(explosion);
        this.game.audio.play('explosion');
    }
    
    applyPowerUp(type, duration = 10000) {
        const endTime = performance.now() + duration;
        
        switch (type) {
            case 'shield':
                this.isShielded = true;
                this.shieldEndTime = endTime;
                break;
            case 'speed':
                this.speedMultiplier = 1.5;
                this.speedEndTime = endTime;
                break;
            case 'power':
                this.isPowered = true;
                this.powerEndTime = endTime;
                break;
            case 'life':
                if (this.type === 'player') {
                    this.game.lives++;
                }
                break;
            case 'bomb':
                this.game.destroyAllEnemies();
                break;
            case 'timer':
                this.game.freezeEnemies(duration);
                break;
        }
    }
    
    respawn(x, y) {
        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.health = this.maxHealth;
        this.direction = DIRECTIONS.UP;
        this.activeBullets = 0;
        this.isShielded = true;
        this.shieldEndTime = performance.now() + 3000;
    }
    
    render(ctx) {
        if (!this.isAlive) return;
        
        ctx.save();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.translate(centerX, centerY);
        
        let rotation = 0;
        switch (this.direction) {
            case DIRECTIONS.UP: rotation = 0; break;
            case DIRECTIONS.RIGHT: rotation = Math.PI / 2; break;
            case DIRECTIONS.DOWN: rotation = Math.PI; break;
            case DIRECTIONS.LEFT: rotation = -Math.PI / 2; break;
        }
        ctx.rotate(rotation);
        
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        ctx.fillStyle = '#333';
        ctx.fillRect(-3, -this.height / 2 - 4, 6, 10);
        
        ctx.fillStyle = '#555';
        ctx.fillRect(-this.width / 2, -this.height / 2, 6, this.height);
        ctx.fillRect(this.width / 2 - 6, -this.height / 2, 6, this.height);
        
        ctx.restore();
        
        if (this.isShielded) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width / 2 + 4, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}