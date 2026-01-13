import { TILE_SIZE, COLORS } from './constants.js';

export class Base {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = TILE_SIZE * 2;
        this.height = TILE_SIZE * 2;
        this.isDestroyed = false;
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
        this.isDestroyed = true;
    }

    draw(ctx) {
        const color = this.isDestroyed ? COLORS.BASE_DESTROYED : COLORS.BASE;
        ctx.fillStyle = color;

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const size = this.width * 0.4;

        ctx.beginPath();
        ctx.moveTo(cx, cy - size);
        ctx.lineTo(cx + size, cy);
        ctx.lineTo(cx + size * 0.6, cy);
        ctx.lineTo(cx + size * 0.6, cy + size);
        ctx.lineTo(cx - size * 0.6, cy + size);
        ctx.lineTo(cx - size * 0.6, cy);
        ctx.lineTo(cx - size, cy);
        ctx.closePath();
        ctx.fill();

        if (!this.isDestroyed) {
            ctx.strokeStyle = '#B8860B';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}
