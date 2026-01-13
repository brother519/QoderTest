import { Entity } from './Entity.js';
import { POWERUP_TYPES, POWERUP_DURATION } from '../constants.js';
import { randomChoice } from '../utils.js';

export class PowerUp extends Entity {
    constructor(game, x, y, type = null) {
        super(x - 13, y - 13, 26, 26);
        this.game = game;
        this.type = type || randomChoice(Object.values(POWERUP_TYPES));
        this.duration = 15000;
        this.spawnTime = performance.now();
        this.blinkRate = 200;
        this.isVisible = true;
    }
    
    update(deltaTime) {
        const elapsed = performance.now() - this.spawnTime;
        
        if (elapsed > this.duration - 3000) {
            this.isVisible = Math.floor(elapsed / this.blinkRate) % 2 === 0;
        }
        
        if (elapsed >= this.duration) {
            this.isAlive = false;
        }
    }
    
    collect(tank) {
        if (!this.isAlive) return;
        
        this.isAlive = false;
        tank.applyPowerUp(this.type, POWERUP_DURATION);
        
        this.game.eventBus.emit('powerUpCollected', {
            type: this.type,
            x: this.x,
            y: this.y
        });
    }
    
    render(ctx) {
        if (!this.isAlive || !this.isVisible) return;
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = this.getColor();
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.getSymbol(), centerX, centerY);
    }
    
    getColor() {
        switch (this.type) {
            case POWERUP_TYPES.SHIELD: return '#3498db';
            case POWERUP_TYPES.SPEED: return '#2ecc71';
            case POWERUP_TYPES.POWER: return '#e74c3c';
            case POWERUP_TYPES.LIFE: return '#f1c40f';
            case POWERUP_TYPES.BOMB: return '#9b59b6';
            case POWERUP_TYPES.TIMER: return '#1abc9c';
            default: return '#fff';
        }
    }
    
    getSymbol() {
        switch (this.type) {
            case POWERUP_TYPES.SHIELD: return '🛡';
            case POWERUP_TYPES.SPEED: return '⚡';
            case POWERUP_TYPES.POWER: return '★';
            case POWERUP_TYPES.LIFE: return '♥';
            case POWERUP_TYPES.BOMB: return '💣';
            case POWERUP_TYPES.TIMER: return '⏱';
            default: return '?';
        }
    }
}
