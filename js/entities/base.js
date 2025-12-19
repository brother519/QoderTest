import { Entity } from './entity.js';
import { CONFIG } from '../config.js';

export class Base extends Entity {
    constructor(x, y) {
        super(x, y, CONFIG.BASE.SIZE, CONFIG.BASE.SIZE);
        this.health = CONFIG.BASE.HEALTH;
        this.color = CONFIG.BASE.COLOR;
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy();
        }
    }

    render(renderer) {
        renderer.drawRect(this.x, this.y, this.width, this.height, this.color);
        
        const innerSize = this.width * 0.6;
        const offset = (this.width - innerSize) / 2;
        renderer.drawRect(
            this.x + offset,
            this.y + offset,
            innerSize,
            innerSize,
            '#FFFF00'
        );
    }
}
