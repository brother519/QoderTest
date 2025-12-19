import { Tank } from './tank.js';
import { CONFIG } from '../config.js';

export class PlayerTank extends Tank {
    constructor(x, y) {
        super(
            x,
            y,
            CONFIG.PLAYER.SIZE,
            CONFIG.PLAYER.SPEED,
            CONFIG.PLAYER.LIVES,
            CONFIG.PLAYER.SHOOT_COOLDOWN,
            CONFIG.PLAYER.COLOR
        );
        this.score = 0;
    }

    handleInput(inputManager) {
        const { dx, dy } = inputManager.getMovement();
        
        if (dx !== 0 || dy !== 0) {
            this.move(dx * this.speed, dy * this.speed);
        }
    }

    addScore(points) {
        this.score += points;
    }
}
