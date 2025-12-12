import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    drawMenu() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('坦克大战', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('WASD / 方向键 - 移动', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        this.ctx.fillText('空格 / J - 射击', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);

        this.ctx.fillStyle = '#0F0';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('按 Enter 或 空格 开始游戏', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
    }

    drawUI(score, lives, level, enemiesLeft) {
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`分数: ${score}`, 10, 20);
        this.ctx.fillText(`生命: ${lives}`, 10, 40);
        this.ctx.fillText(`关卡: ${level}`, 10, 60);
        this.ctx.fillText(`敌人: ${enemiesLeft}`, CANVAS_WIDTH - 80, 20);
    }

    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        this.ctx.fillStyle = '#F00';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('按 Enter 重新开始', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    }

    drawWin() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        this.ctx.fillStyle = '#0F0';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('胜利!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('按 Enter 重新开始', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    }
}
