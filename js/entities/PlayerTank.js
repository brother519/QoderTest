import { Tank } from './Tank.js';
import { COLORS, DIRECTIONS, MAX_PLAYER_BULLETS } from '../constants.js';
import { distance } from '../utils.js';

export class PlayerTank extends Tank {
    constructor(game, x, y) {
        super(game, x, y, 'player');
        this.color = COLORS.PLAYER_TANK;
        this.maxBullets = MAX_PLAYER_BULLETS;
        this.maxHealth = 1;
        this.health = 1;
        
        this.moveTarget = null;
        this.isMovingToTarget = false;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        if (!this.isAlive) return;
        
        const input = this.game.input;
        
        const keyDirection = input.getMovementDirection();
        
        if (keyDirection) {
            this.moveTarget = null;
            this.isMovingToTarget = false;
            this.move(keyDirection, deltaTime);
        } else {
            const newTarget = input.getMoveTarget();
            if (newTarget) {
                this.moveTarget = newTarget;
                this.isMovingToTarget = true;
            }
            
            if (this.isMovingToTarget && this.moveTarget) {
                this.moveTowardsTarget(deltaTime);
            }
        }
        
        if (input.isMouseDown('left')) {
            const mousePos = input.getMousePosition();
            const center = this.getCenter();
            const dir = input.getDirectionToMouse(center.x, center.y);
            if (dir !== this.direction) {
                this.direction = dir;
            }
        }
        
        if (input.isFirePressed()) {
            this.fire();
        }
    }
    
    moveTowardsTarget(deltaTime) {
        if (!this.moveTarget) return;
        
        const center = this.getCenter();
        const dx = this.moveTarget.x - center.x;
        const dy = this.moveTarget.y - center.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 5) {
            this.moveTarget = null;
            this.isMovingToTarget = false;
            return;
        }
        
        let direction;
        if (Math.abs(dx) > Math.abs(dy)) {
            direction = dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
        } else {
            direction = dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
        }
        
        const moved = this.move(direction, deltaTime);
        if (!moved) {
            if (Math.abs(dx) > Math.abs(dy)) {
                direction = dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
            } else {
                direction = dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
            }
            this.move(direction, deltaTime);
        }
    }
    
    destroy() {
        super.destroy();
        this.game.eventBus.emit('playerDestroyed', {});
    }
    
    render(ctx) {
        super.render(ctx);
        
        if (this.moveTarget && this.isMovingToTarget) {
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.moveTarget.x, this.moveTarget.y, 8, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}
