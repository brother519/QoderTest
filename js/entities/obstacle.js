import { Entity } from './entity.js';
import { CONFIG } from '../config.js';

export class Obstacle extends Entity {
    constructor(x, y, type) {
        super(x, y, CONFIG.GRID_SIZE, CONFIG.GRID_SIZE);
        this.type = type;
        
        let obstacleConfig;
        switch (type) {
            case CONFIG.MAP.BRICK:
                obstacleConfig = CONFIG.OBSTACLE.BRICK;
                break;
            case CONFIG.MAP.STEEL:
                obstacleConfig = CONFIG.OBSTACLE.STEEL;
                break;
            case CONFIG.MAP.WATER:
                obstacleConfig = CONFIG.OBSTACLE.WATER;
                break;
            default:
                obstacleConfig = CONFIG.OBSTACLE.BRICK;
        }
        
        this.color = obstacleConfig.COLOR;
        this.destructible = obstacleConfig.DESTRUCTIBLE;
        this.blocksTank = obstacleConfig.BLOCKS_TANK;
        this.blocksBullet = obstacleConfig.BLOCKS_BULLET;
        this.health = this.destructible ? 1 : Infinity;
    }

    takeDamage(damage) {
        if (!this.destructible) return;
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy();
        }
    }

    render(renderer) {
        renderer.drawRect(this.x, this.y, this.width, this.height, this.color);
    }
}
