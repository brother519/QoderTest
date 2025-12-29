import { Game } from './Game.js';
import { Engine } from './Engine.js';
import { Camera } from './Camera.js';
import { Level } from './level/Level.js';
import { LevelLoader } from './level/LevelLoader.js';
import { CONSTANTS } from './utils/Constants.js';

async function init() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const loadingDiv = document.getElementById('loading');

    const game = new Game(canvas, ctx);

    const camera = new Camera(
        CONSTANTS.CANVAS_WIDTH,
        CONSTANTS.CANVAS_HEIGHT,
        1600,
        240
    );
    game.camera = camera;

    loadingDiv.textContent = '加载关卡中...';
    const levelData = await LevelLoader.loadLevel('src/levels/level-1-1.json');
    
    if (!levelData) {
        loadingDiv.textContent = '加载失败！';
        return;
    }

    const level = new Level(game, levelData);
    game.loadLevel(level);
    camera.setTarget(level.player);

    loadingDiv.classList.add('hidden');

    const engine = new Engine(game);

    window.addEventListener('keydown', (e) => {
        if (game.state === CONSTANTS.GAME_STATES.MENU && e.code === 'Space') {
            game.setState(CONSTANTS.GAME_STATES.PLAYING);
        } else if (game.state === CONSTANTS.GAME_STATES.PAUSED && e.code === 'Escape') {
            game.setState(CONSTANTS.GAME_STATES.PLAYING);
        } else if (game.state === CONSTANTS.GAME_STATES.GAME_OVER && e.code === 'Space') {
            location.reload();
        }
    });

    engine.start();

    console.log('游戏初始化完成！');
    console.log('控制说明：');
    console.log('- 方向键/WASD：移动');
    console.log('- 空格/Z：跳跃');
    console.log('- Shift/X：奔跑');
    console.log('- ESC/P：暂停');
}

window.addEventListener('load', init);
