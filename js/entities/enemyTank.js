import { Tank } from './tank.js';
import { CONFIG } from '../config.js';

export class EnemyTank extends Tank {
    constructor(x, y, type = 'normal') {
        const config = CONFIG.ENEMY[type.toUpperCase()];
        
        super(
            x,
            y,
            CONFIG.PLAYER.SIZE,
            config.SPEED,
            config.HEALTH,
            config.SHOOT_COOLDOWN,
            config.COLOR
        );
        
        this.type = type;
        this.aiTimer = 0;
        this.aiUpdateInterval = 60;
        this.currentAction = 'move';
    }

    update(dt) {
        super.update(dt);
        this.aiTimer++;
    }
}
