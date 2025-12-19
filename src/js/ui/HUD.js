import { CONFIG } from '../utils/Config.js';

export class HUD {
  constructor() {
    this.visible = true;
  }

  render(ctx, gameData) {
    if (!this.visible) return;

    const { player, score, level, levelProgress, enemies } = gameData;

    if (!player) return;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';

    ctx.fillText(`生命: ${player.health}/${player.maxHealth}`, 10, 30);

    const barWidth = 200;
    const barHeight = 20;
    const barX = 10;
    const barY = 40;

    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    const healthPercent = player.health / player.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : (healthPercent > 0.25 ? '#ffff00' : '#ff0000');
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(`火力等级: ${player.firePower}`, 10, 85);
    ctx.fillText(`分数: ${score}`, 10, 110);
    ctx.fillText(`关卡: ${level}`, 10, 135);

    if (levelProgress !== undefined) {
      const progressBarX = 10;
      const progressBarY = 145;
      const progressBarWidth = 200;
      const progressBarHeight = 15;

      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);

      ctx.fillStyle = '#00aaff';
      ctx.fillRect(progressBarX, progressBarY, progressBarWidth * levelProgress, progressBarHeight);

      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.fillText(`进度: ${Math.floor(levelProgress * 100)}%`, progressBarX + progressBarWidth + 10, progressBarY + 12);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.fillText(`敌机: ${enemies}`, 10, 185);

    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('空格: 射击', CONFIG.CANVAS_WIDTH - 10, CONFIG.CANVAS_HEIGHT - 50);
    ctx.fillText('WASD/方向键: 移动', CONFIG.CANVAS_WIDTH - 10, CONFIG.CANVAS_HEIGHT - 30);
    ctx.fillText('ESC: 暂停', CONFIG.CANVAS_WIDTH - 10, CONFIG.CANVAS_HEIGHT - 10);

    ctx.restore();
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}
