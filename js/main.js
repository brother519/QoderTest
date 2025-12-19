import { Game } from './game.js';
import { CONFIG } from './config.js';

window.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('game-canvas');
    const game = new Game(canvas);
    
    await game.init();
    
    let spacePressed = false;
    let escPressed = false;

    window.addEventListener('keydown', (e) => {
        if (e.code === CONFIG.KEYS.SHOOT && !spacePressed) {
            spacePressed = true;
            if (game.state === CONFIG.GAME_STATE.MENU) {
                game.start();
            } else if (game.state === CONFIG.GAME_STATE.WIN || game.state === CONFIG.GAME_STATE.LOSE) {
                game.levelManager.reset();
                game.start();
            }
        }
        
        if (e.code === CONFIG.KEYS.PAUSE && !escPressed) {
            escPressed = true;
            if (game.state === CONFIG.GAME_STATE.PAUSED) {
                game.state = CONFIG.GAME_STATE.PLAYING;
            }
        }
    });
    
    window.addEventListener('keyup', (e) => {
        if (e.code === CONFIG.KEYS.SHOOT) {
            spacePressed = false;
        }
        if (e.code === CONFIG.KEYS.PAUSE) {
            escPressed = false;
        }
    });

    game.render();
});