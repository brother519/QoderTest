import { Game } from './core/Game.js';

// 游戏入口
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    const game = new Game(canvas);
    game.start();
    
    console.log('超级坦克大战已启动！按 Enter 开始游戏。');
});
