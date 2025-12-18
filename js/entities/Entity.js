import { DIRECTIONS, DIRECTION_VECTORS } from '../constants.js';

export class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.direction = DIRECTIONS.UP;
        this.speed = 0;
        this.isAlive = true;
        this.sprite = null;
    }
    
    update(deltaTime) {
    }
    
    render(ctx) {
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
    
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    move(direction, deltaTime) {
        const vector = DIRECTION_VECTORS[direction];
        if (!vector) return;
        
        this.direction = direction;
        const distance = this.speed * (deltaTime / 1000);
        this.x += vector.x * distance;
        this.y += vector.y * distance;
    }
    
    destroy() {
        this.isAlive = false;
    }
    
    distanceTo(other) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const ox = other.x + other.width / 2;
        const oy = other.y + other.height / 2;
        
        return Math.sqrt((ox - cx) ** 2 + (oy - cy) ** 2);
    }
}
