// 输入管理器 - 处理键盘输入
class InputManager {
    constructor() {
        this.keys = {};
        this.keyPressed = {}; // 用于防止按键重复触发
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 监听键盘按下
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // 防止方向键滚动页面
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        // 监听键盘释放
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            this.keyPressed[e.key] = false;
        });
    }
    
    /**
     * 检查按键是否按下
     */
    isKeyDown(key) {
        return this.keys[key] || false;
    }
    
    /**
     * 检查按键是否刚刚按下（防止重复触发）
     */
    isKeyPressed(key) {
        if (this.keys[key] && !this.keyPressed[key]) {
            this.keyPressed[key] = true;
            return true;
        }
        return false;
    }
    
    /**
     * 获取方向输入
     */
    getDirectionInput() {
        if (this.isKeyDown('ArrowUp') || this.isKeyDown('w') || this.isKeyDown('W')) {
            return Constants.DIRECTION.UP;
        }
        if (this.isKeyDown('ArrowDown') || this.isKeyDown('s') || this.isKeyDown('S')) {
            return Constants.DIRECTION.DOWN;
        }
        if (this.isKeyDown('ArrowLeft') || this.isKeyDown('a') || this.isKeyDown('A')) {
            return Constants.DIRECTION.LEFT;
        }
        if (this.isKeyDown('ArrowRight') || this.isKeyDown('d') || this.isKeyDown('D')) {
            return Constants.DIRECTION.RIGHT;
        }
        return null;
    }
    
    /**
     * 检查射击按键
     */
    isFirePressed() {
        return this.isKeyPressed(' ');
    }
    
    /**
     * 检查暂停/开始按键
     */
    isPausePressed() {
        return this.isKeyPressed('Enter');
    }
}
