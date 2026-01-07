// EventManager.js - 事件管理器
class EventManager {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.game = game;
        this.eventListeners = {};
        
        // 绑定事件监听器
        this.initEventListeners();
    }

    // 初始化事件监听器
    initEventListeners() {
        // 鼠标事件
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
        this.canvas.addEventListener('mousemove', this.handleCanvasMouseMove.bind(this));
        
        // 触摸事件（移动端支持）
        this.canvas.addEventListener('touchstart', this.handleCanvasTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleCanvasTouchMove.bind(this));
        
        // 按钮事件
        document.getElementById('restartBtn')?.addEventListener('click', this.handleRestartClick.bind(this));
        document.getElementById('hintBtn')?.addEventListener('click', this.handleHintClick.bind(this));
        document.getElementById('nextLevelBtn')?.addEventListener('click', this.handleNextLevelClick.bind(this));
        document.getElementById('playAgainBtn')?.addEventListener('click', this.handlePlayAgainClick.bind(this));
        
        // 键盘事件
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // 窗口大小变化事件
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    // 处理画布点击事件
    handleCanvasClick(event) {
        if (!this.game || !this.game.isGameActive()) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        
        // 让游戏处理点击事件
        this.game.handleCardClick(x, y);
    }

    // 处理画布鼠标移动事件（用于悬停效果）
    handleCanvasMouseMove(event) {
        if (!this.game || !this.game.isGameActive()) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        
        // 更新悬停卡片状态
        this.game.handleMouseMove(x, y);
    }

    // 处理触摸开始事件
    handleCanvasTouchStart(event) {
        if (!this.game || !this.game.isGameActive()) return;
        
        event.preventDefault(); // 阻止默认触摸行为
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const touch = event.touches[0];
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;
        
        // 处理触摸点击
        this.game.handleCardClick(x, y);
    }

    // 处理触摸移动事件
    handleCanvasTouchMove(event) {
        event.preventDefault(); // 阻止页面滚动
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const touch = event.touches[0];
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;
        
        // 更新悬停状态
        this.game.handleMouseMove(x, y);
    }

    // 处理重新开始按钮点击
    handleRestartClick() {
        this.game.restartLevel();
    }

    // 处理提示按钮点击
    handleHintClick() {
        this.game.provideHint();
    }

    // 处理下一关按钮点击
    handleNextLevelClick() {
        this.game.nextLevel();
    }

    // 处理再玩一次按钮点击
    handlePlayAgainClick() {
        this.game.restartGame();
    }

    // 处理键盘按键事件
    handleKeyDown(event) {
        switch(event.key) {
            case 'r':
            case 'R':
                // R键重新开始
                this.game.restartLevel();
                break;
            case ' ':
                // 空格键提供提示
                event.preventDefault(); // 阻止页面滚动
                this.game.provideHint();
                break;
            case 'p':
            case 'P':
                // P键暂停/继续
                this.game.togglePause();
                break;
            case 'ArrowRight':
                // 右箭头进入下一关
                this.game.nextLevel();
                break;
            case 'ArrowLeft':
                // 左箭头重新开始当前关卡
                this.game.restartLevel();
                break;
        }
    }

    // 处理窗口大小变化
    handleResize() {
        // 通知游戏调整大小
        if (this.game) {
            this.game.handleResize();
        }
    }

    // 添加自定义事件监听器
    addEventListener(eventType, callback) {
        if (!this.eventListeners[eventType]) {
            this.eventListeners[eventType] = [];
        }
        this.eventListeners[eventType].push(callback);
    }

    // 移除事件监听器
    removeEventListener(eventType, callback) {
        if (this.eventListeners[eventType]) {
            const index = this.eventListeners[eventType].indexOf(callback);
            if (index > -1) {
                this.eventListeners[eventType].splice(index, 1);
            }
        }
    }

    // 触发自定义事件
    dispatchEvent(eventType, data) {
        if (this.eventListeners[eventType]) {
            for (const callback of this.eventListeners[eventType]) {
                callback(data);
            }
        }
    }

    // 清理所有事件监听器
    cleanup() {
        // 移除所有事件监听器
        this.canvas.removeEventListener('click', this.handleCanvasClick);
        this.canvas.removeEventListener('mousemove', this.handleCanvasMouseMove);
        this.canvas.removeEventListener('touchstart', this.handleCanvasTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleCanvasTouchMove);
        
        document.getElementById('restartBtn')?.removeEventListener('click', this.handleRestartClick);
        document.getElementById('hintBtn')?.removeEventListener('click', this.handleHintClick);
        document.getElementById('nextLevelBtn')?.removeEventListener('click', this.handleNextLevelClick);
        document.getElementById('playAgainBtn')?.removeEventListener('click', this.handlePlayAgainClick);
        
        document.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('resize', this.handleResize);
        
        // 清空事件监听器列表
        this.eventListeners = {};
    }

    // 检查是否点击在游戏区域外
    isClickOutsideGameArea(x, y) {
        // 检查点击是否在Canvas区域内
        return x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height;
    }

    // 获取鼠标相对于Canvas的位置
    getMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    }

    // 获取触摸相对于Canvas的位置
    getTouchPosition(touchEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const touch = touchEvent.touches[0];
        return {
            x: (touch.clientX - rect.left) * scaleX,
            y: (touch.clientY - rect.top) * scaleY
        };
    }

    // 启用/禁用特定类型的事件
    setEventEnabled(eventType, enabled) {
        // 这里可以实现特定事件的启用/禁用逻辑
        // 例如在动画进行时禁用点击事件
        if (eventType === 'click' && this.canvas) {
            if (enabled) {
                this.canvas.style.pointerEvents = 'auto';
            } else {
                this.canvas.style.pointerEvents = 'none';
            }
        }
    }
}