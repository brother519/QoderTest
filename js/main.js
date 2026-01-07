// 游戏入口

import { Game } from './game.js';

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    console.log('飞机大战游戏初始化...');

    const canvas = document.getElementById('game-canvas');
    const game = new Game(canvas);

    // 开始按钮
    const startButton = document.getElementById('start-button');
    startButton.addEventListener('click', () => {
        document.getElementById('menu-screen').classList.add('hidden');
        game.start();
    });

    // 重新开始按钮
    const restartButton = document.getElementById('restart-button');
    restartButton.addEventListener('click', () => {
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('menu-screen').classList.remove('hidden');
        game.reset();
    });

    // 启动游戏循环
    requestAnimationFrame((timestamp) => game.gameLoop(timestamp));

    console.log('游戏初始化完成!');
});
