import { Scene } from './Scene.js';

/**
 * 菜单场景
 */
export class MenuScene extends Scene {
    constructor(sceneManager) {
        super(sceneManager);
        this.menuScreen = document.getElementById('menu-screen');
        this.setupButtons();
    }
    
    /**
     * 设置按钮事件
     */
    setupButtons() {
        const btnSingle = document.getElementById('btn-single');
        const btnDouble = document.getElementById('btn-double');
        
        btnSingle.addEventListener('click', () => {
            this.startGame(1);
        });
        
        btnDouble.addEventListener('click', () => {
            this.startGame(2);
        });
    }
    
    /**
     * 开始游戏
     */
    startGame(playerCount) {
        this.sceneManager.switchTo('game', { playerCount });
    }
    
    /**
     * 进入场景
     */
    enter(data) {
        this.menuScreen.style.display = 'flex';
    }
    
    /**
     * 退出场景
     */
    exit() {
        this.menuScreen.style.display = 'none';
    }
    
    /**
     * 更新场景
     */
    update(deltaTime) {
        // 菜单场景不需要更新逻辑
    }
    
    /**
     * 渲染场景
     */
    render(renderer) {
        // 菜单通过HTML渲染，Canvas只显示背景
        renderer.clear();
    }
}
