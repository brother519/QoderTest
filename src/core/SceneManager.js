import { MenuScene } from '../scenes/MenuScene.js';
import { GameScene } from '../scenes/GameScene.js';
import { CONFIG } from '../config.js';

/**
 * 场景管理器
 * 控制场景切换和场景生命周期
 */
export class SceneManager {
    constructor(engine) {
        this.engine = engine;
        this.currentScene = null;
        this.scenes = new Map();
        
        // 注册所有场景
        this.registerScenes();
        
        // 切换到菜单场景
        this.switchTo('menu');
    }
    
    /**
     * 注册所有场景
     */
    registerScenes() {
        this.scenes.set('menu', new MenuScene(this));
        this.scenes.set('game', new GameScene(this));
    }
    
    /**
     * 切换场景
     */
    switchTo(sceneName, data = {}) {
        // 退出当前场景
        if (this.currentScene) {
            this.currentScene.exit();
        }
        
        // 获取新场景
        const newScene = this.scenes.get(sceneName);
        if (!newScene) {
            console.error(`Scene ${sceneName} not found`);
            return;
        }
        
        // 进入新场景
        this.currentScene = newScene;
        this.currentScene.enter(data);
    }
    
    /**
     * 获取游戏引擎
     */
    getEngine() {
        return this.engine;
    }
}
