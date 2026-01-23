import { Config } from '../utils/Config.js';

// 渲染引擎
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.scale(dpr, dpr);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }
  
  clear() {
    this.ctx.fillStyle = Config.CANVAS_BG_COLOR;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  
  save() {
    this.ctx.save();
  }
  
  restore() {
    this.ctx.restore();
  }
  
  translate(x, y) {
    this.ctx.translate(x, y);
  }
  
  drawPlatform(platform, isActive = false) {
    const ctx = this.ctx;
    const { x, y, width, height, color } = platform;
    
    // 绘制阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 5, y + 5, width, height);
    
    // 绘制平台主体
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, this.darkenColor(color, 30));
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    
    // 如果是当前平台，添加高亮边框
    if (isActive) {
      ctx.strokeStyle = '#FFD93D';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    }
    
    // 绘制中心标记
    const centerX = x + width / 2;
    const perfectZone = width * Config.PERFECT_ZONE_RATIO;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(centerX - perfectZone / 2, y, perfectZone, height);
  }
  
  drawPlayer(player) {
    const ctx = this.ctx;
    const { position, radius, state, chargeTime } = player;
    
    ctx.save();
    ctx.translate(position.x, position.y);
    
    // 蓄力时压缩变形
    let scaleX = 1;
    let scaleY = 1;
    if (state === 'CHARGING') {
      const chargeRatio = Math.min(chargeTime / Config.MAX_CHARGE_TIME, 1);
      scaleY = 1 - chargeRatio * 0.3; // 垂直压缩
      scaleX = 1 + chargeRatio * 0.2; // 水平拉伸
    }
    
    ctx.scale(scaleX, scaleY);
    
    // 绘制阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(3, 3, radius, radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制玩家主体
    const gradient = ctx.createRadialGradient(
      -radius * 0.3, -radius * 0.3, 0,
      0, 0, radius
    );
    const baseColor = state === 'CHARGING' ? Config.PLAYER_CHARGE_COLOR : Config.PLAYER_COLOR;
    gradient.addColorStop(0, this.lightenColor(baseColor, 30));
    gradient.addColorStop(1, baseColor);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-radius * 0.3, -radius * 0.3, radius * 0.3, radius * 0.2, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  drawChargeIndicator(player) {
    if (player.state !== 'CHARGING') return;
    
    const ctx = this.ctx;
    const { position, chargeTime } = player;
    const chargeRatio = Math.min(chargeTime / Config.MAX_CHARGE_TIME, 1);
    
    // 绘制蓄力进度条
    const barWidth = 60;
    const barHeight = 8;
    const barX = position.x - barWidth / 2;
    const barY = position.y - 50;
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // 进度
    const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
    gradient.addColorStop(0, '#4ECDC4');
    gradient.addColorStop(0.5, '#FFD93D');
    gradient.addColorStop(1, '#FF6B6B');
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, barWidth * chargeRatio, barHeight);
    
    // 边框
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }
  
  drawUI(score, highScore, combo) {
    const ctx = this.ctx;
    
    // 分数
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${score}`, 30, 50);
    
    // 最高分
    ctx.font = '18px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(`最高: ${highScore}`, 30, 80);
    
    // 连击
    if (combo > 0) {
      ctx.textAlign = 'center';
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#FFD93D';
      ctx.fillText(`连击 x${combo}`, this.width / 2, 50);
    }
  }
  
  drawStartScreen() {
    const ctx = this.ctx;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('跳一跳', this.width / 2, this.height / 2 - 50);
    
    ctx.font = '24px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('按住蓄力，松开跳跃', this.width / 2, this.height / 2 + 20);
    
    ctx.font = '20px Arial';
    ctx.fillText('点击开始', this.width / 2, this.height / 2 + 70);
  }
  
  drawGameOverScreen(score, highScore, isNewRecord) {
    const ctx = this.ctx;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('游戏结束', this.width / 2, this.height / 2 - 80);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`得分: ${score}`, this.width / 2, this.height / 2);
    
    if (isNewRecord) {
      ctx.fillStyle = '#FFD93D';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('新纪录!', this.width / 2, this.height / 2 + 40);
    }
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '20px Arial';
    ctx.fillText(`最高分: ${highScore}`, this.width / 2, this.height / 2 + 80);
    
    ctx.fillStyle = '#4ECDC4';
    ctx.fillText('点击重新开始', this.width / 2, this.height / 2 + 130);
  }
  
  drawPerfectEffect(x, y) {
    const ctx = this.ctx;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#FFD93D';
    ctx.fillText('Perfect!', x, y - 60);
    ctx.restore();
  }
  
  // 辅助方法：使颜色变暗
  darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }
  
  // 辅助方法：使颜色变亮
  lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min((num >> 16) + amt, 255);
    const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
    const B = Math.min((num & 0x0000FF) + amt, 255);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }
}
