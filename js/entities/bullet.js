import { Entity } from './entity.js';
import { CONFIG } from '../config.js';

export class Bullet extends Entity {
    constructor(x, y, dx, dy, owner) {
        super(x, y, CONFIG.BULLET.SIZE, CONFIG.BULLET.SIZE);
        this.dx = dx;
        this.dy = dy;
        this.owner = owner;
        this.damage = CONFIG.BULLET.DAMAGE;
    }

    update(dt) {
        this.x += this.dx;
        this.y += this.dy;
        
        if (this.x < 0 || this.x > CONFIG.CANVAS_WIDTH ||
            this.y < 0 || this.y > CONFIG.CANVAS_HEIGHT) {
            this.destroy();
        }
    }

    render(renderer) {
        renderer.drawRect(this.x, this.y, this.width, this.height, CONFIG.BULLET.COLOR);
    }
}
