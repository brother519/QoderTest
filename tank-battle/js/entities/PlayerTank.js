import { Tank } from './Tank.js';
import { DIRECTION, KEY_CODES, TANK_CONFIG } from '../utils/Constants.js';

// 玩家坦克
export class PlayerTank extends Tank {
    constructor(x, y) {
        super(x, y);
        this.isPlayer = true;
        this.color = '#4CAF50'; // 绿色
        this.speed = TANK_CONFIG.PLAYER_SPEED;
        this.level = 1; // 坦克等级
    }

    // 更新(处理输入)
    update(deltaTime, keys) {
        super.update(deltaTime);
        
        // 处理移动
        let moved = false;
        
        if (this.isKeyPressed(keys, KEY_CODES.UP)) {
            this.move(DIRECTION.UP);
            moved = true;
        } else if (this.isKeyPressed(keys, KEY_CODES.DOWN)) {
            this.move(DIRECTION.DOWN);
            moved = true;
        } else if (this.isKeyPressed(keys, KEY_CODES.LEFT)) {
            this.move(DIRECTION.LEFT);
            moved = true;
        } else if (this.isKeyPressed(keys, KEY_CODES.RIGHT)) {
            this.move(DIRECTION.RIGHT);
            moved = true;
        }
        
        // 如果移动了，对齐到网格
        if (moved) {
            this.alignToGrid();
        }
    }

    // 检查按键是否按下
    isKeyPressed(keys, keyCodes) {
        return keyCodes.some(code => keys[code]);
    }

    // 升级坦克
    upgrade() {
        this.level = Math.min(this.level + 1, 4);
        
        switch (this.level) {
            case 2:
                this.bulletSpeed = TANK_CONFIG.BULLET_SPEED * 1.2;
                break;
            case 3:
                this.bulletDamage = 2;
                break;
            case 4:
                this.bulletEnhanced = true; // 可以打穿钢墙
                break;
        }
    }
}
