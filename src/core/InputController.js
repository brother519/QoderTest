import { KEYS } from '../config.js';

/**
 * 输入控制器
 * 负责捕获并处理用户输入
 */
export class InputController {
    constructor() {
        // 按键状态表
        this.keyStates = new Map();
        
        // 上一帧按键状态
        this.prevKeyStates = new Map();
        
        // 绑定事件监听
        this.bindEvents();
    }
    
    /**
     * 绑定键盘事件
     */
    bindEvents() {
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
    
    /**
     * 处理按键按下
     */
    handleKeyDown(event) {
        this.keyStates.set(event.key, true);
        
        // 阻止某些默认行为
        if (event.key === ' ' || event.key.startsWith('Arrow')) {
            event.preventDefault();
        }
    }
    
    /**
     * 处理按键抬起
     */
    handleKeyUp(event) {
        this.keyStates.set(event.key, false);
    }
    
    /**
     * 更新输入状态
     */
    update() {
        // 保存上一帧状态
        this.prevKeyStates = new Map(this.keyStates);
    }
    
    /**
     * 检查按键是否按下
     */
    isKeyDown(keys) {
        if (!Array.isArray(keys)) {
            keys = [keys];
        }
        return keys.some(key => this.keyStates.get(key) === true);
    }
    
    /**
     * 检查按键是否刚刚按下（本帧按下，上一帧未按下）
     */
    isKeyPressed(keys) {
        if (!Array.isArray(keys)) {
            keys = [keys];
        }
        return keys.some(key => 
            this.keyStates.get(key) === true && 
            this.prevKeyStates.get(key) !== true
        );
    }
    
    /**
     * 检查玩家1的移动输入
     */
    getPlayer1Input() {
        return {
            up: this.isKeyDown(KEYS.P1_UP),
            down: this.isKeyDown(KEYS.P1_DOWN),
            left: this.isKeyDown(KEYS.P1_LEFT),
            right: this.isKeyDown(KEYS.P1_RIGHT),
            shoot: this.isKeyPressed(KEYS.P1_SHOOT)
        };
    }
    
    /**
     * 检查玩家2的移动输入
     */
    getPlayer2Input() {
        return {
            up: this.isKeyDown(KEYS.P2_UP),
            down: this.isKeyDown(KEYS.P2_DOWN),
            left: this.isKeyDown(KEYS.P2_LEFT),
            right: this.isKeyDown(KEYS.P2_RIGHT),
            shoot: this.isKeyPressed(KEYS.P2_SHOOT)
        };
    }
    
    /**
     * 检查暂停键
     */
    isPausePressed() {
        return this.isKeyPressed(KEYS.PAUSE);
    }
    
    /**
     * 清除所有按键状态
     */
    clear() {
        this.keyStates.clear();
        this.prevKeyStates.clear();
    }
}
