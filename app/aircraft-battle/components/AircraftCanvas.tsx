'use client';

import { useEffect, useRef } from 'react';
import { AircraftGameState, EnemyType, PowerUpType } from '../types/game';
import { AIRCRAFT_CONFIG } from '../constants/config';

interface AircraftCanvasProps {
  state: AircraftGameState;
}

// 敌机颜色配置
const ENEMY_COLORS: Record<EnemyType, { body: string; detail: string }> = {
  small: { body: '#FF4444', detail: '#CC0000' },
  medium: { body: '#FF8800', detail: '#CC6600' },
  large: { body: '#CC2222', detail: '#990000' },
  boss: { body: '#9933CC', detail: '#6611AA' },
};

// 道具颜色配置
const POWERUP_COLORS: Record<PowerUpType, { bg: string; symbol: string }> = {
  life: { bg: '#22CC44', symbol: '♥' },
  fireRate: { bg: '#FFCC00', symbol: '⚡' },
  spread: { bg: '#3388FF', symbol: '🔱' },
  bomb: { bg: '#FF3333', symbol: '💣' },
};

export function AircraftCanvas({ state }: AircraftCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const { width, height } = AIRCRAFT_CONFIG;

      // 1. 绘制星空背景
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0a0a1a');
      gradient.addColorStop(1, '#1a1a3a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 绘制星星
      for (const star of state.stars) {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. 绘制玩家飞机
      const player = state.player;
      const px = player.x + player.width / 2;
      const py = player.y + player.height / 2;

      // 无敌状态闪烁效果
      if (!player.invincible || Math.floor(Date.now() / 100) % 2 === 0) {
        // 尾焰动画
        const flameHeight = 15 + Math.sin(Date.now() / 50) * 5;
        const flameGradient = ctx.createLinearGradient(0, py + player.height / 2, 0, py + player.height / 2 + flameHeight);
        flameGradient.addColorStop(0, '#00CCFF');
        flameGradient.addColorStop(0.5, '#0088FF');
        flameGradient.addColorStop(1, 'rgba(0, 100, 255, 0)');
        ctx.fillStyle = flameGradient;
        ctx.beginPath();
        ctx.moveTo(px - 5, py + player.height / 2);
        ctx.lineTo(px, py + player.height / 2 + flameHeight);
        ctx.lineTo(px + 5, py + player.height / 2);
        ctx.fill();

        // 飞机机身（三角形）
        ctx.fillStyle = '#E0F0FF';
        ctx.beginPath();
        ctx.moveTo(px, py - player.height / 2);
        ctx.lineTo(px - player.width / 2, py + player.height / 2);
        ctx.lineTo(px, py + player.height / 4);
        ctx.lineTo(px + player.width / 2, py + player.height / 2);
        ctx.closePath();
        ctx.fill();

        // 机翼
        ctx.fillStyle = '#66AAFF';
        ctx.beginPath();
        ctx.moveTo(px - player.width / 2, py + player.height / 4);
        ctx.lineTo(px - player.width / 2 - 8, py + player.height / 2);
        ctx.lineTo(px - player.width / 2 + 5, py + player.height / 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(px + player.width / 2, py + player.height / 4);
        ctx.lineTo(px + player.width / 2 + 8, py + player.height / 2);
        ctx.lineTo(px + player.width / 2 - 5, py + player.height / 2);
        ctx.fill();

        // 驾驶舱
        ctx.fillStyle = '#88CCFF';
        ctx.beginPath();
        ctx.arc(px, py - player.height / 6, 6, 0, Math.PI * 2);
        ctx.fill();

        // 机身高光
        ctx.strokeStyle = '#CCDDFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, py - player.height / 2 + 5);
        ctx.lineTo(px - player.width / 4, py + player.height / 4);
        ctx.stroke();
      }

      // 3. 绘制敌机
      for (const enemy of state.enemies) {
        const ex = enemy.x + enemy.width / 2;
        const ey = enemy.y + enemy.height / 2;
        const colors = ENEMY_COLORS[enemy.type];

        if (enemy.type === 'small') {
          // 小型红色三角形
          ctx.fillStyle = colors.body;
          ctx.beginPath();
          ctx.moveTo(ex, ey + enemy.height / 2);
          ctx.lineTo(ex - enemy.width / 2, ey - enemy.height / 2);
          ctx.lineTo(ex + enemy.width / 2, ey - enemy.height / 2);
          ctx.closePath();
          ctx.fill();
        } else if (enemy.type === 'medium') {
          // 中等橙色飞机
          ctx.fillStyle = colors.body;
          ctx.beginPath();
          ctx.moveTo(ex, ey + enemy.height / 2);
          ctx.lineTo(ex - enemy.width / 2, ey - enemy.height / 2);
          ctx.lineTo(ex, ey - enemy.height / 4);
          ctx.lineTo(ex + enemy.width / 2, ey - enemy.height / 2);
          ctx.closePath();
          ctx.fill();

          // 机翼
          ctx.fillStyle = colors.detail;
          ctx.fillRect(ex - enemy.width / 2 - 5, ey - enemy.height / 4, 10, enemy.height / 3);
          ctx.fillRect(ex + enemy.width / 2 - 5, ey - enemy.height / 4, 10, enemy.height / 3);
        } else if (enemy.type === 'large') {
          // 大型深红飞机
          ctx.fillStyle = colors.body;
          ctx.beginPath();
          ctx.moveTo(ex, ey + enemy.height / 2);
          ctx.lineTo(ex - enemy.width / 3, ey - enemy.height / 2);
          ctx.lineTo(ex + enemy.width / 3, ey - enemy.height / 2);
          ctx.closePath();
          ctx.fill();

          // 宽机翼
          ctx.fillStyle = colors.detail;
          ctx.beginPath();
          ctx.moveTo(ex - enemy.width / 2, ey);
          ctx.lineTo(ex - enemy.width / 3, ey - enemy.height / 4);
          ctx.lineTo(ex - enemy.width / 3, ey + enemy.height / 4);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(ex + enemy.width / 2, ey);
          ctx.lineTo(ex + enemy.width / 3, ey - enemy.height / 4);
          ctx.lineTo(ex + enemy.width / 3, ey + enemy.height / 4);
          ctx.closePath();
          ctx.fill();
        } else if (enemy.type === 'boss') {
          // Boss紫色飞机
          ctx.fillStyle = colors.body;
          ctx.beginPath();
          ctx.moveTo(ex, ey + enemy.height / 2);
          ctx.lineTo(ex - enemy.width / 3, ey - enemy.height / 2);
          ctx.lineTo(ex, ey - enemy.height / 3);
          ctx.lineTo(ex + enemy.width / 3, ey - enemy.height / 2);
          ctx.closePath();
          ctx.fill();

          // 大型机翼
          ctx.fillStyle = colors.detail;
          ctx.fillRect(ex - enemy.width / 2 - 10, ey - enemy.height / 4, 15, enemy.height / 2);
          ctx.fillRect(ex + enemy.width / 2 - 5, ey - enemy.height / 4, 15, enemy.height / 2);

          // 核心发光
          ctx.fillStyle = '#AA66FF';
          ctx.beginPath();
          ctx.arc(ex, ey, 8, 0, Math.PI * 2);
          ctx.fill();

          // Boss血条
          const hpPercent = enemy.hp / enemy.maxHp;
          const barWidth = enemy.width + 10;
          const barHeight = 6;
          const barX = ex - barWidth / 2;
          const barY = enemy.y - 12;

          // 血条背景
          ctx.fillStyle = '#330000';
          ctx.fillRect(barX, barY, barWidth, barHeight);

          // 血条填充
          const hpGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
          hpGradient.addColorStop(0, '#FF3333');
          hpGradient.addColorStop(1, '#FF6666');
          ctx.fillStyle = hpGradient;
          ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);

          // 血条边框
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.strokeRect(barX, barY, barWidth, barHeight);
        }
      }

      // 4. 绘制子弹
      for (const bullet of state.bullets) {
        if (bullet.isPlayerBullet) {
          // 玩家子弹 - 亮蓝色矩形
          const gradient = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + bullet.height);
          gradient.addColorStop(0, '#00FFFF');
          gradient.addColorStop(1, '#0088FF');
          ctx.fillStyle = gradient;
          ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

          // 子弹光晕
          ctx.fillStyle = 'rgba(0, 200, 255, 0.3)';
          ctx.beginPath();
          ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // 敌机子弹 - 红色圆形
          ctx.fillStyle = '#FF6633';
          ctx.beginPath();
          ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 2, 0, Math.PI * 2);
          ctx.fill();

          // 子弹核心
          ctx.fillStyle = '#FFAA66';
          ctx.beginPath();
          ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. 绘制道具
      for (const powerUp of state.powerUps) {
        const colors = POWERUP_COLORS[powerUp.type];
        const pulse = 1 + Math.sin(Date.now() / 150) * 0.1;

        // 闪烁背景
        ctx.fillStyle = colors.bg;
        ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 100) * 0.2;
        ctx.beginPath();
        ctx.arc(
          powerUp.x + powerUp.width / 2,
          powerUp.y + powerUp.height / 2,
          (powerUp.width / 2) * pulse,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.globalAlpha = 1;

        // 道具方块
        ctx.fillStyle = colors.bg;
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);

        // 边框
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);

        // 符号
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(colors.symbol, powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2 + 5);
      }

      // 6. 绘制爆炸效果
      for (const explosion of state.explosions) {
        const progress = explosion.frame / explosion.maxFrames;
        const radius = explosion.radius * (0.2 + progress * 0.8);
        const alpha = 1 - progress;

        // 外圈橙黄色
        const outerGradient = ctx.createRadialGradient(
          explosion.x, explosion.y, 0,
          explosion.x, explosion.y, radius
        );
        outerGradient.addColorStop(0, `rgba(255, 255, 100, ${alpha})`);
        outerGradient.addColorStop(0.5, `rgba(255, 150, 50, ${alpha * 0.8})`);
        outerGradient.addColorStop(1, `rgba(255, 50, 0, 0)`);

        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // 内圈白色核心
        const innerRadius = radius * 0.4;
        ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, innerRadius, 0, Math.PI * 2);
        ctx.fill();
      }

    };

    render();
  });

  return (
    <canvas
      ref={canvasRef}
      width={AIRCRAFT_CONFIG.width}
      height={AIRCRAFT_CONFIG.height}
      className="border-2 border-slate-700 rounded-lg"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
