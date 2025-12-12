import { Tank } from './tank.js';
import { COLORS, DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT, ENEMY_FIRE_COOLDOWN } from './constants.js';

export class EnemyTank extends Tank {
    constructor(x, y) {
        const types = ['normal', 'fast', 'armor'];
        const type = types[Math.floor(Math.random() * types.length)];
        let color = COLORS.ENEMY_NORMAL;
        let speed = 1.5;
        let health = 1;

        switch (type) {
            case 'fast':
                color = COLORS.ENEMY_FAST;
                speed = 2.5;
                break;
            case 'armor':
                color = COLORS.ENEMY_ARMOR;
                speed = 1;
                health = 3;
                break;
        }

        super(x, y, color);
        this.type = type;
        this.speed = speed;
        this.health = health;
        this.fireCooldown = ENEMY_FIRE_COOLDOWN;
        this.moveTimer = 0;
        this.moveInterval = 1000 + Math.random() * 2000;
        this.targetDirection = DIR_DOWN;
        this.direction = DIR_DOWN;
    }

    think(deltaTime) {
        this.moveTimer += deltaTime;
        if (this.moveTimer >= this.moveInterval) {
            this.chooseNewDirection();
        }
    }

    chooseNewDirection() {
        this.moveTimer = 0;
        this.moveInterval = 500 + Math.random() * 1500;
        const directions = [DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT];
        const weights = [1, 3, 2, 2];
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < directions.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                this.targetDirection = directions[i];
                break;
            }
        }
    }

    shouldFire() {
        return Math.random() < 0.02 && this.canFire();
    }

    takeDamage() {
        this.health--;
        if (this.health <= 0) {
            this.isAlive = false;
        }
    }

    update(deltaTime) {
    }
}
