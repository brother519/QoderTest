import { CONFIG } from './config.js';
import { InputController } from './core/InputController.js';
import { Renderer } from './core/Renderer.js';
import { SceneManager } from './core/SceneManager.js';
import { AudioManager } from './core/AudioManager.js';

/**
 * 游戏引擎核心类
 * 负责管理游戏主循环、时间控制和状态管理
 */
export class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 设置画布尺寸
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        
        // 初始化核心系统
        this.inputController = new InputController();
        this.renderer = new Renderer(this.ctx);
        this.audioManager = new AudioManager();
        this.sceneManager = new SceneManager(this);
        
        // 时间控制
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.isRunning = false;
        
        // 帧率统计
        this.frameCount = 0;
        this.fps = 0;
        this.fpsUpdateTime = 0;
    }
    
    /**
     * 启动游戏引擎
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        
        // 加载音效
        this.audioManager.loadSounds();
        
        this.gameLoop();
    }
    
    /**
     * 停止游戏引擎
     */
    stop() {
        this.isRunning = false;
    }
    
    /**
     * 游戏主循环
     */
    gameLoop = (currentTime = 0) => {
        if (!this.isRunning) return;
        
        // 计算时间差
        this.deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // 固定时间步长更新
        if (this.deltaTime >= CONFIG.FRAME_DURATION) {
            // 更新游戏逻辑
            this.update(this.deltaTime);
            
            // 渲染画面
            this.render();
            
            // 更新FPS统计
            this.updateFPS(currentTime);
        }
        
        // 请求下一帧
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * 更新游戏逻辑
     */
    update(deltaTime) {
        // 更新输入状态
        this.inputController.update();
        
        // 更新当前场景
        if (this.sceneManager.currentScene) {
            this.sceneManager.currentScene.update(deltaTime);
        }
    }
    
    /**
     * 渲染游戏画面
     */
    render() {
        // 清空画布
        this.renderer.clear();
        
        // 渲染当前场景
        if (this.sceneManager.currentScene) {
            this.sceneManager.currentScene.render(this.renderer);
        }
    }
    
    /**
     * 更新FPS统计
     */
    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.fpsUpdateTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
        }
    }
    
    /**
     * 获取当前FPS
     */
    getFPS() {
        return this.fps;
    }
}
