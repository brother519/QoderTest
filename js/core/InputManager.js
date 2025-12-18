import { KEYS, DIRECTIONS } from '../constants.js';
import { angleBetween, angleToDirection } from '../utils.js';

export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keysDown = new Set();
        this.keysPressed = new Set();
        this.keysReleased = new Set();
        
        this.mousePosition = { x: 0, y: 0 };
        this.mouseDown = { left: false, right: false };
        this.mouseClicked = { left: false, right: false };
        
        this.enabled = true;
        this.init();
    }
    
    init() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    onKeyDown(e) {
        if (!this.enabled) return;
        
        const code = e.code;
        if (!this.keysDown.has(code)) {
            this.keysPressed.add(code);
        }
        this.keysDown.add(code);
        
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
            e.preventDefault();
        }
    }
    
    onKeyUp(e) {
        const code = e.code;
        this.keysDown.delete(code);
        this.keysReleased.add(code);
    }
    
    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePosition.x = e.clientX - rect.left;
        this.mousePosition.y = e.clientY - rect.top;
    }
    
    onMouseDown(e) {
        if (!this.enabled) return;
        
        if (e.button === 0) {
            this.mouseDown.left = true;
            this.mouseClicked.left = true;
        } else if (e.button === 2) {
            this.mouseDown.right = true;
            this.mouseClicked.right = true;
        }
    }
    
    onMouseUp(e) {
        if (e.button === 0) {
            this.mouseDown.left = false;
        } else if (e.button === 2) {
            this.mouseDown.right = false;
        }
    }
    
    update() {
        this.keysPressed.clear();
        this.keysReleased.clear();
        this.mouseClicked.left = false;
        this.mouseClicked.right = false;
    }
    
    isKeyDown(keyName) {
        const keys = KEYS[keyName];
        if (!keys) return false;
        return keys.some(k => this.keysDown.has(k));
    }
    
    isKeyPressed(keyName) {
        const keys = KEYS[keyName];
        if (!keys) return false;
        return keys.some(k => this.keysPressed.has(k));
    }
    
    isKeyReleased(keyName) {
        const keys = KEYS[keyName];
        if (!keys) return false;
        return keys.some(k => this.keysReleased.has(k));
    }
    
    getMovementDirection() {
        if (this.isKeyDown('UP')) return DIRECTIONS.UP;
        if (this.isKeyDown('DOWN')) return DIRECTIONS.DOWN;
        if (this.isKeyDown('LEFT')) return DIRECTIONS.LEFT;
        if (this.isKeyDown('RIGHT')) return DIRECTIONS.RIGHT;
        return null;
    }
    
    isFirePressed() {
        return this.isKeyPressed('FIRE') || this.mouseClicked.left;
    }
    
    isFireDown() {
        return this.isKeyDown('FIRE') || this.mouseDown.left;
    }
    
    isPausePressed() {
        return this.isKeyPressed('PAUSE');
    }
    
    isConfirmPressed() {
        return this.isKeyPressed('CONFIRM') || this.mouseClicked.left;
    }
    
    getMousePosition() {
        return { ...this.mousePosition };
    }
    
    isMouseClicked(button = 'left') {
        return this.mouseClicked[button];
    }
    
    isMouseDown(button = 'left') {
        return this.mouseDown[button];
    }
    
    getDirectionToMouse(fromX, fromY) {
        const angle = angleBetween(fromX, fromY, this.mousePosition.x, this.mousePosition.y);
        return angleToDirection(angle);
    }
    
    getMoveTarget() {
        if (this.mouseClicked.right) {
            return { ...this.mousePosition };
        }
        return null;
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.keysDown.clear();
            this.keysPressed.clear();
            this.mouseDown.left = false;
            this.mouseDown.right = false;
        }
    }
}
