import { DIRECTIONS } from '../constants.js';
import { randomChoice, distance } from '../utils.js';

export class AIController {
    constructor(tank, game) {
        this.tank = tank;
        this.game = game;
        
        this.thinkInterval = 1000 + Math.random() * 2000;
        this.lastThinkTime = 0;
        this.currentDirection = randomChoice(Object.values(DIRECTIONS));
        
        this.fireChance = 0.02;
        this.targetPreference = Math.random() > 0.5 ? 'player' : 'base';
        
        this.stuckTimer = 0;
        this.lastPosition = { x: tank.x, y: tank.y };
    }
    
    update(deltaTime) {
        this.lastThinkTime += deltaTime;
        
        this.checkIfStuck(deltaTime);
        
        if (this.lastThinkTime >= this.thinkInterval) {
            this.think();
            this.lastThinkTime = 0;
            this.thinkInterval = 800 + Math.random() * 1500;
        }
        
        const moved = this.tank.move(this.currentDirection, deltaTime);
        
        if (!moved) {
            this.changeDirection();
        }
        
        this.tryFire();
    }
    
    think() {
        const player = this.game.player;
        
        if (player && player.isAlive && Math.random() > 0.3) {
            this.currentDirection = this.getDirectionToTarget(
                player.x + player.width / 2,
                player.y + player.height / 2
            );
        } else if (this.game.map && this.game.map.baseTiles.length > 0 && Math.random() > 0.5) {
            const base = this.game.map.baseTiles[0];
            this.currentDirection = this.getDirectionToTarget(
                base.x + base.width / 2,
                base.y + base.height / 2
            );
        } else {
            this.currentDirection = randomChoice(Object.values(DIRECTIONS));
        }
    }
    
    getDirectionToTarget(targetX, targetY) {
        const dx = targetX - (this.tank.x + this.tank.width / 2);
        const dy = targetY - (this.tank.y + this.tank.height / 2);
        
        if (Math.random() > 0.7) {
            return randomChoice(Object.values(DIRECTIONS));
        }
        
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
        } else {
            return dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
        }
    }
    
    changeDirection() {
        const directions = Object.values(DIRECTIONS).filter(d => d !== this.currentDirection);
        this.currentDirection = randomChoice(directions);
    }
    
    checkIfStuck(deltaTime) {
        const dx = Math.abs(this.tank.x - this.lastPosition.x);
        const dy = Math.abs(this.tank.y - this.lastPosition.y);
        
        if (dx < 1 && dy < 1) {
            this.stuckTimer += deltaTime;
            
            if (this.stuckTimer > 500) {
                this.changeDirection();
                this.stuckTimer = 0;
            }
        } else {
            this.stuckTimer = 0;
        }
        
        this.lastPosition.x = this.tank.x;
        this.lastPosition.y = this.tank.y;
    }
    
    tryFire() {
        if (Math.random() < this.fireChance) {
            const target = this.getFireTarget();
            if (target) {
                this.tank.fire();
            }
        }
        
        if (Math.random() < 0.01) {
            this.tank.fire();
        }
    }
    
    getFireTarget() {
        const player = this.game.player;
        if (!player || !player.isAlive) return null;
        
        const tankCenter = this.tank.getCenter();
        const playerCenter = player.getCenter();
        
        const dx = playerCenter.x - tankCenter.x;
        const dy = playerCenter.y - tankCenter.y;
        
        const alignmentThreshold = 30;
        
        switch (this.tank.direction) {
            case DIRECTIONS.UP:
                if (dy < 0 && Math.abs(dx) < alignmentThreshold) return player;
                break;
            case DIRECTIONS.DOWN:
                if (dy > 0 && Math.abs(dx) < alignmentThreshold) return player;
                break;
            case DIRECTIONS.LEFT:
                if (dx < 0 && Math.abs(dy) < alignmentThreshold) return player;
                break;
            case DIRECTIONS.RIGHT:
                if (dx > 0 && Math.abs(dy) < alignmentThreshold) return player;
                break;
        }
        
        return null;
    }
}
