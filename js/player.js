import { Tank } from './tank.js';
import { COLORS } from './constants.js';

export class PlayerTank extends Tank {
    constructor(x, y) {
        super(x, y, COLORS.PLAYER);
        this.shield = true;
        this.shieldTimer = 3000;
        this.shieldBlink = 0;
    }

    update(deltaTime) {
        if (this.shield) {
            this.shieldTimer -= deltaTime;
            this.shieldBlink += deltaTime;
            if (this.shieldTimer <= 0) {
                this.shield = false;
            }
        }
    }

    fire() {
        return super.fire('player');
    }

    respawn(x, y) {
        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.shield = true;
        this.shieldTimer = 3000;
    }

    draw(ctx) {
        super.draw(ctx);

        if (this.shield && Math.floor(this.shieldBlink / 100) % 2 === 0) {
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.width / 2 + 4,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }
    }
}
