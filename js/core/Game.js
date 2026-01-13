import { CONFIG } from '../utils/Config.js';
import { Engine } from './Engine.js';
import { Input } from './Input.js';
import { SceneManager } from './SceneManager.js';

export class Game {
    constructor() {
        this.engine = new Engine();
        this.input = new Input();
        this.sceneManager = new SceneManager();
        
        this.lastTime = performance.now();
        this.running = false;
        
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTime = 0;
    }
    
    start() {
        this.running = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    stop() {
        this.running = false;
    }
    
    gameLoop() {
        if (!this.running) return;
        
        const currentTime = performance.now();
        let deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        if (deltaTime > CONFIG.MAX_DELTA_TIME) {
            deltaTime = CONFIG.MAX_DELTA_TIME;
        }
        
        this.updateFPS(deltaTime);
        
        this.update(deltaTime);
        this.render(deltaTime);
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        this.sceneManager.update(deltaTime);
    }
    
    render(deltaTime) {
        this.engine.clear();
        this.engine.drawBackground(deltaTime);
        
        const ctx = this.engine.getContext();
        this.sceneManager.render(ctx);
        
        this.renderFPS(ctx);
    }
    
    updateFPS(deltaTime) {
        this.frameCount++;
        this.fpsTime += deltaTime;
        
        if (this.fpsTime >= 1.0) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTime = 0;
        }
    }
    
    renderFPS(ctx) {
        ctx.fillStyle = '#00ff88';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`FPS: ${this.fps}`, 10, CONFIG.CANVAS_HEIGHT - 10);
    }
}
