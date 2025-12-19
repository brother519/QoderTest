import { CONFIG } from '../config.js';

export class Menu {
    constructor() {
    }

    renderMenu(renderer) {
        renderer.drawText(
            '坦克大战',
            CONFIG.CANVAS_WIDTH / 2,
            CONFIG.CANVAS_HEIGHT / 2 - 50,
            '#FFFFFF',
            '48px Arial',
            'center'
        );
        renderer.drawText(
            '按空格键开始',
            CONFIG.CANVAS_WIDTH / 2,
            CONFIG.CANVAS_HEIGHT / 2 + 20,
            '#FFFFFF',
            '24px Arial',
            'center'
        );
    }

    renderPause(renderer) {
        renderer.drawRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT, 'rgba(0, 0, 0, 0.7)');
        renderer.drawText(
            '游戏暂停',
            CONFIG.CANVAS_WIDTH / 2,
            CONFIG.CANVAS_HEIGHT / 2 - 30,
            '#FFFFFF',
            '36px Arial',
            'center'
        );
        renderer.drawText(
            '按ESC继续',
            CONFIG.CANVAS_WIDTH / 2,
            CONFIG.CANVAS_HEIGHT / 2 + 20,
            '#FFFFFF',
            '20px Arial',
            'center'
        );
    }

    renderGameOver(renderer, win, score) {
        renderer.drawText(
            win ? '胜利!' : '失败!',
            CONFIG.CANVAS_WIDTH / 2,
            CONFIG.CANVAS_HEIGHT / 2 - 50,
            win ? '#00FF00' : '#FF0000',
            '48px Arial',
            'center'
        );
        renderer.drawText(
            `得分: ${score}`,
            CONFIG.CANVAS_WIDTH / 2,
            CONFIG.CANVAS_HEIGHT / 2 + 10,
            '#FFFFFF',
            '24px Arial',
            'center'
        );
        renderer.drawText(
            '按空格键重新开始',
            CONFIG.CANVAS_WIDTH / 2,
            CONFIG.CANVAS_HEIGHT / 2 + 60,
            '#FFFFFF',
            '20px Arial',
            'center'
        );
    }
}
