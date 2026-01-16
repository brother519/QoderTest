// 输入处理器 - 监听键盘和鼠标事件
export class InputHandler {
    constructor() {
        this.keys = {};
        this.mouseDown = false;
        this.init();
    }
    
    init() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // 鼠标事件监听
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
            canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
            canvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));
        }
    }
    
    onMouseDown(event) {
        if (event.button === 0) { // 左键
            this.mouseDown = true;
            event.preventDefault();
        }
    }
    
    onMouseUp(event) {
        if (event.button === 0) { // 左键
            this.mouseDown = false;
        }
    }
    
    onKeyDown(event) {
        this.keys[event.code] = true;
        
        // 防止方向键滚动页面
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
            event.preventDefault();
        }
    }
    
    onKeyUp(event) {
        this.keys[event.code] = false;
    }
    
    isKeyPressed(keyCode) {
        return this.keys[keyCode] === true;
    }
    
    // 检查是否按下向上键
    isUpPressed() {
        return this.isKeyPressed('ArrowUp') || this.isKeyPressed('KeyW');
    }
    
    // 检查是否按下向下键
    isDownPressed() {
        return this.isKeyPressed('ArrowDown') || this.isKeyPressed('KeyS');
    }
    
    // 检查是否按下向左键
    isLeftPressed() {
        return this.isKeyPressed('ArrowLeft') || this.isKeyPressed('KeyA');
    }
    
    // 检查是否按下向右键
    isRightPressed() {
        return this.isKeyPressed('ArrowRight') || this.isKeyPressed('KeyD');
    }
    
    // 检查是否按下射击键（空格或鼠标左键）
    isFirePressed() {
        return this.isKeyPressed('Space') || this.mouseDown;
    }
    
    // 检查是否按下暂停键
    isPausePressed() {
        return this.isKeyPressed('KeyP');
    }
    
    // 重置所有输入状态
    reset() {
        this.keys = {};
        this.mouseDown = false;
    }
}