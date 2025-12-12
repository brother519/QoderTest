import { BULLET_SIZE, BULLET_SPEED, CANVAS_WIDTH, CANVAS_HEIGHT, DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT, COLORS } from './constants.js';

export class Bullet {
    constructor(x, y, direction, owner) {
        this.x = x - BULLET_SIZE / 2;
        this.y = y - BULLET_SIZE / 2;
        this.width = BULLET_SIZE;
        this.height = BULLET_SIZE;
        this.direction = direction;
        this.speed = BULLET_SPEED;
        this.owner = owner;
        this.isActive = true;
    }

    update() {
        switch (this.direction) {
            case DIR_UP:
                this.y -= this.speed;
                break;
            case DIR_DOWN:
                this.y += this.speed;
                break;
            case DIR_LEFT:
                this.x -= this.speed;
                break;
            case DIR_RIGHT:
                this.x += this.speed;
                break;
        }
    }

    isOutOfBounds() {
        return this.x < 0 || this.x > CANVAS_WIDTH ||
               this.y < 0 || this.y > CANVAS_HEIGHT;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    destroy() {
        this.isActive = false;
    }

    draw(ctx) {
        ctx.fillStyle = COLORS.BULLET;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
