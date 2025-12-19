import { CONFIG } from '../config.js';

export class InputManager {
    constructor() {
        this.keys = new Map();
        
        window.addEventListener('keydown', (e) => {
            this.keys.set(e.code, true);
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys.set(e.code, false);
        });
    }

    isKeyDown(keyCode) {
        return this.keys.get(keyCode) === true;
    }

    getMovement() {
        let dx = 0;
        let dy = 0;
        
        if (this.isKeyDown(CONFIG.KEYS.UP)) dy -= 1;
        if (this.isKeyDown(CONFIG.KEYS.DOWN)) dy += 1;
        if (this.isKeyDown(CONFIG.KEYS.LEFT)) dx -= 1;
        if (this.isKeyDown(CONFIG.KEYS.RIGHT)) dx += 1;
        
        return { dx, dy };
    }

    isShootPressed() {
        return this.isKeyDown(CONFIG.KEYS.SHOOT);
    }

    isPausePressed() {
        return this.isKeyDown(CONFIG.KEYS.PAUSE);
    }
}
