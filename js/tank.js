import { TANK_SIZE, TANK_SPEED, DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT, FIRE_COOLDOWN } from './constants.js';
import { Bullet } from './bullet.js';

export class Tank {
    constructor(x, y, color = '#808080') {
        this.x = x;
        this.y = y;
        this.width = TANK_SIZE;
        this.height = TANK_SIZE;
        this.speed = TANK_SPEED;
        this.direction = DIR_UP;
        this.color = color;
        this.isAlive = true;
        this.lastFireTime = 0;
        this.fireCooldown = FIRE_COOLDOWN;
    }

    move(direction) {
        let newX = this.x;
        let newY = this.y;

        switch (direction) {
            case DIR_UP:
                newY -= this.speed;
                break;
            case DIR_DOWN:
                newY += this.speed;
                break;
            case DIR_LEFT:
                newX -= this.speed;
                break;
            case DIR_RIGHT:
                newX += this.speed;
                break;
        }

        return { x: newX, y: newY, width: this.width, height: this.height };
    }

    applyMove(newPos, direction) {
        this.x = newPos.x;
        this.y = newPos.y;
        this.direction = direction;
    }

    canFire() {
        return Date.now() - this.lastFireTime >= this.fireCooldown;
    }

    fire(owner = 'enemy') {
        if (!this.canFire()) return null;

        this.lastFireTime = Date.now();
        let bulletX = this.x + this.width / 2;
        let bulletY = this.y + this.height / 2;

        switch (this.direction) {
            case DIR_UP:
                bulletY = this.y;
                break;
            case DIR_DOWN:
                bulletY = this.y + this.height;
                break;
            case DIR_LEFT:
                bulletX = this.x;
                break;
            case DIR_RIGHT:
                bulletX = this.x + this.width;
                break;
        }

        return new Bullet(bulletX, bulletY, this.direction, owner);
    }

    takeDamage() {
        this.isAlive = false;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#333';
        const barrelWidth = 4;
        const barrelLength = 10;
        let bx, by, bw, bh;

        switch (this.direction) {
            case DIR_UP:
                bx = this.x + this.width / 2 - barrelWidth / 2;
                by = this.y - barrelLength + 4;
                bw = barrelWidth;
                bh = barrelLength;
                break;
            case DIR_DOWN:
                bx = this.x + this.width / 2 - barrelWidth / 2;
                by = this.y + this.height - 4;
                bw = barrelWidth;
                bh = barrelLength;
                break;
            case DIR_LEFT:
                bx = this.x - barrelLength + 4;
                by = this.y + this.height / 2 - barrelWidth / 2;
                bw = barrelLength;
                bh = barrelWidth;
                break;
            case DIR_RIGHT:
                bx = this.x + this.width - 4;
                by = this.y + this.height / 2 - barrelWidth / 2;
                bw = barrelLength;
                bh = barrelWidth;
                break;
        }

        ctx.fillRect(bx, by, bw, bh);
    }
}
