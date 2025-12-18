import { Entity } from './Entity.js';
import { BULLET_SIZE, BULLET_SPEED, DIRECTION_VECTORS, COLORS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';
import { Explosion } from './Explosion.js';

export class Bullet extends Entity {
    constructor(game, x, y, direction, owner, isPowered = false) {
        super(x, y, BULLET_SIZE, BULLET_SIZE);
        this.game = game;
        this.direction = direction;
        this.owner = owner;
        this.speed = BULLET_SPEED;
        this.damage = 1;
        this.canDestroySteel = isPowered;
        this.isActive = true;
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        const vector = DIRECTION_VECTORS[this.direction];
        const distance = this.speed * (deltaTime / 1000);
        
        this.x += vector.x * distance;
        this.y += vector.y * distance;
        
        if (this.x < 0 || this.x > CANVAS_WIDTH - this.width ||
            this.y < 0 || this.y > CANVAS_HEIGHT - this.height) {
            this.destroy();
        }
    }
    
    destroy() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.isAlive = false;
        
        if (this.owner && this.owner.onBulletDestroyed) {
            this.owner.onBulletDestroyed();
        }
        
        const center = this.getCenter();
        const explosion = new Explosion(this.game, center.x, center.y, 'small');
        this.game.addExplosion(explosion);
    }
    
    onHit(target) {
        this.destroy();
    }
    
    render(ctx) {
        if (!this.isActive) return;
        
        ctx.fillStyle = COLORS.BULLET;
        ctx.beginPath();
        ctx.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        if (this.canDestroySteel) {
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
}