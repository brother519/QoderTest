// 输入控制系统
class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.mouseDown = false;
        this.shootRequested = false;
        
        this.init();
    }
    
    init() {
        // 键盘事件监听
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // 鼠标事件监听
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        
        // 防止右键菜单
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    onKeyDown(e) {
        this.keys[e.key] = true;
        this.keys[e.code] = true;
        
        // 空格键射击
        if (e.code === 'Space') {
            this.shootRequested = true;
            e.preventDefault();
        }
    }
    
    onKeyUp(e) {
        this.keys[e.key] = false;
        this.keys[e.code] = false;
    }
    
    onMouseDown(e) {
        // 鼠标左键射击
        if (e.button === 0) {
            this.mouseDown = true;
            this.shootRequested = true;
        }
    }
    
    onMouseUp(e) {
        if (e.button === 0) {
            this.mouseDown = false;
        }
    }
    
    // 检查是否有移动输入
    isMoving() {
        return this.isUpPressed() || this.isDownPressed() || 
               this.isLeftPressed() || this.isRightPressed();
    }
    
    // 获取移动方向
    getMoveDirection() {
        if (this.isUpPressed()) return CONFIG.DIRECTION.UP;
        if (this.isDownPressed()) return CONFIG.DIRECTION.DOWN;
        if (this.isLeftPressed()) return CONFIG.DIRECTION.LEFT;
        if (this.isRightPressed()) return CONFIG.DIRECTION.RIGHT;
        return null;
    }
    
    // 方向键或WASD - 上
    isUpPressed() {
        return this.keys['ArrowUp'] || this.keys['w'] || this.keys['W'];
    }
    
    // 方向键或WASD - 下
    isDownPressed() {
        return this.keys['ArrowDown'] || this.keys['s'] || this.keys['S'];
    }
    
    // 方向键或WASD - 左
    isLeftPressed() {
        return this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A'];
    }
    
    // 方向键或WASD - 右
    isRightPressed() {
        return this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'];
    }
    
    // 检查是否请求射击（空格键或鼠标左键）
    isShootRequested() {
        if (this.shootRequested) {
            this.shootRequested = false;
            return true;
        }
        return false;
    }
    
    // 检查ESC键（暂停）
    isEscPressed() {
        return this.keys['Escape'];
    }
    
    // 重置输入状态
    reset() {
        this.keys = {};
        this.mouseDown = false;
        this.shootRequested = false;
    }
}
