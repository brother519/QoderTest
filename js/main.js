import { Game } from './core/Game.js';
import { drawText } from './utils/Draw.js';

window.addEventListener('load', () => {
    const game = new Game();
    
    const testScene = {
        enter() {
            console.log('Test scene entered');
        },
        
        update(deltaTime) {
        },
        
        render(ctx) {
            drawText(ctx, '飞机大战', 200, 200, '#00ff88', 48);
            drawText(ctx, '游戏引擎初始化成功', 200, 260, '#ffffff', 20);
            drawText(ctx, '按任意键开始', 200, 320, '#ffd700', 16);
        },
        
        exit() {
            console.log('Test scene exited');
        }
    };
    
    game.sceneManager.registerScene('test', testScene);
    game.sceneManager.changeScene('test');
    
    game.start();
    
    console.log('游戏已启动');
});
