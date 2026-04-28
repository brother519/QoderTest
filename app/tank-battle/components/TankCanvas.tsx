'use client';

import { useEffect, useRef } from 'react';
import {
  TileType,
  Tank,
  Bullet,
  Explosion,
  PowerUp,
  PowerUpType,
  Direction,
} from '../types/game';
import { TankGameConfig } from '../types/game';

interface TankCanvasProps {
  config: TankGameConfig;
  map: TileType[][];
  player: Tank;
  enemies: Tank[];
  playerBullets: Bullet[];
  enemyBullets: Bullet[];
  explosions: Explosion[];
  powerUps: PowerUp[];
  tankSize: number;
  bulletSize: number;
  shieldTimer: number;
}

const TILE_COLORS: Record<TileType, string> = {
  [TileType.EMPTY]: '#000000',
  [TileType.BRICK]: '#B5651D',
  [TileType.STEEL]: '#A0A0A0',
  [TileType.WATER]: '#4488CC',
  [TileType.TREE]: '#228B22',
  [TileType.BASE]: '#FFD700',
};

function drawTankShape(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number,
  dir: Direction,
  bodyColor: string,
  turretColor: string,
) {
  // 坦克主体
  ctx.fillStyle = bodyColor;
  ctx.fillRect(x + 2, y + 2, size - 4, size - 4);

  // 履带
  ctx.fillStyle = '#333';
  if (dir === 'UP' || dir === 'DOWN') {
    ctx.fillRect(x, y, 4, size);
    ctx.fillRect(x + size - 4, y, 4, size);
  } else {
    ctx.fillRect(x, y, size, 4);
    ctx.fillRect(x, y + size - 4, size, 4);
  }

  // 炮塔
  ctx.fillStyle = turretColor;
  const cx = x + size / 2;
  const cy = y + size / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, size / 4, 0, Math.PI * 2);
  ctx.fill();

  // 炮管
  ctx.strokeStyle = turretColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  const barrelLen = size / 2;
  const dx = dir === 'LEFT' ? -1 : dir === 'RIGHT' ? 1 : 0;
  const dy = dir === 'UP' ? -1 : dir === 'DOWN' ? 1 : 0;
  ctx.lineTo(cx + dx * barrelLen, cy + dy * barrelLen);
  ctx.stroke();
}

export function TankCanvas({
  config,
  map,
  player,
  enemies,
  playerBullets,
  enemyBullets,
  explosions,
  powerUps,
  tankSize,
  bulletSize,
  shieldTimer,
}: TankCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const w = config.cols * config.tileSize;
  const h = config.rows * config.tileSize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    // 绘制地图
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        const tile = map[r][c];
        if (tile === TileType.EMPTY) continue;
        ctx.fillStyle = TILE_COLORS[tile];
        const tx = c * config.tileSize;
        const ty = r * config.tileSize;
        ctx.fillRect(tx, ty, config.tileSize, config.tileSize);

        // 砖块纹理
        if (tile === TileType.BRICK) {
          ctx.strokeStyle = '#8B4513';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(tx, ty, config.tileSize / 2, config.tileSize / 2);
          ctx.strokeRect(tx + config.tileSize / 2, ty + config.tileSize / 2, config.tileSize / 2, config.tileSize / 2);
        }
        // 钢墙高光
        if (tile === TileType.STEEL) {
          ctx.fillStyle = '#C0C0C0';
          ctx.fillRect(tx + 2, ty + 2, config.tileSize - 4, 2);
          ctx.fillRect(tx + 2, ty + 2, 2, config.tileSize - 4);
        }
        // 基地图标
        if (tile === TileType.BASE) {
          ctx.fillStyle = '#FF0000';
          ctx.font = `${config.tileSize - 2}px serif`;
          ctx.fillText('★', tx + 1, ty + config.tileSize - 2);
        }
      }
    }

    // 绘制道具
    for (const pu of powerUps) {
      const colors: Record<PowerUpType, string> = {
        [PowerUpType.STAR]: '#FFD700',
        [PowerUpType.SHIELD]: '#00BFFF',
        [PowerUpType.LIFE]: '#FF69B4',
      };
      ctx.fillStyle = colors[pu.type];
      ctx.beginPath();
      ctx.arc(pu.x + tankSize / 2, pu.y + tankSize / 2, tankSize / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      const label = pu.type === PowerUpType.STAR ? '★' : pu.type === PowerUpType.SHIELD ? '▣' : '♥';
      ctx.fillText(label, pu.x + tankSize / 2, pu.y + tankSize / 2 + 4);
    }

    // 绘制敌人坦克
    for (const e of enemies) {
      drawTankShape(ctx, e.x, e.y, tankSize, e.direction, '#C0392B', '#E74C3C');
    }

    // 绘制玩家坦克
    drawTankShape(ctx, player.x, player.y, tankSize, player.direction, '#2ECC71', '#27AE60');

    // 护盾效果
    if (shieldTimer > 0) {
      ctx.strokeStyle = `rgba(0, 200, 255, ${0.5 + 0.3 * Math.sin(Date.now() / 100)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x + tankSize / 2, player.y + tankSize / 2, tankSize / 2 + 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 绘制子弹
    ctx.fillStyle = '#FFFF00';
    for (const b of playerBullets) {
      ctx.fillRect(b.x, b.y, bulletSize, bulletSize);
    }
    ctx.fillStyle = '#FF6600';
    for (const b of enemyBullets) {
      ctx.fillRect(b.x, b.y, bulletSize, bulletSize);
    }

    // 绘制爆炸
    for (const exp of explosions) {
      const progress = exp.frame / exp.maxFrames;
      const radius = tankSize * (0.3 + progress * 0.7);
      const alpha = 1 - progress;
      ctx.fillStyle = `rgba(255, ${Math.floor(165 * (1 - progress))}, 0, ${alpha})`;
      ctx.beginPath();
      ctx.arc(exp.x + tankSize / 2, exp.y + tankSize / 2, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 255, 100, ${alpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(exp.x + tankSize / 2, exp.y + tankSize / 2, radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 绘制树木（最上层，遮挡坦克）
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        if (map[r][c] === TileType.TREE) {
          ctx.fillStyle = '#228B22';
          ctx.fillRect(c * config.tileSize, r * config.tileSize, config.tileSize, config.tileSize);
          ctx.fillStyle = '#196619';
          ctx.fillRect(c * config.tileSize + 2, r * config.tileSize + 2, config.tileSize - 4, config.tileSize - 4);
        }
      }
    }

    ctx.textAlign = 'start';
  });

  return (
    <canvas
      ref={canvasRef}
      width={w}
      height={h}
      className="border-2 border-gray-700 rounded-lg bg-black"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
