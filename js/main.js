import { Game } from './core/Game.js';

// 游戏入口
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    // 创建游戏实例
    const game = new Game(canvas);
    
    // 暴露到全局用于调试
    window.game = game;
});
