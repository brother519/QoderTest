import type { GameState, Tank, Bullet, Explosion, PowerUp } from '../types';
import { TileType } from '../types';
import { TILE_SIZE, TANK_SIZE, BULLET_SIZE, COLORS } from '../constants';

export class RenderSystem {
  static render(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    this.clearCanvas(ctx);
    this.drawMap(ctx, gameState.map);
    this.drawBase(ctx, gameState.base);
    this.drawPowerUps(ctx, gameState.powerUps);
    this.drawBullets(ctx, gameState.bullets);
    if (gameState.player) {
      this.drawTank(ctx, gameState.player);
    }
    if (gameState.player2) {
      this.drawTank(ctx, gameState.player2);
    }
    gameState.enemies.forEach(enemy => {
      this.drawTank(ctx, enemy);
    });
    this.drawExplosions(ctx, gameState.explosions);
    this.drawGrassOverlay(ctx, gameState.map);
  }

  private static clearCanvas(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = COLORS.EMPTY;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  private static drawMap(ctx: CanvasRenderingContext2D, map: TileType[][]): void {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const tile = map[y][x];
        if (tile === TileType.EMPTY || tile === TileType.GRASS) continue;
        
        const color = this.getTileColor(tile);
        ctx.fillStyle = color;
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        
        if (tile === TileType.BRICK) {
          ctx.strokeStyle = '#654321';
          ctx.lineWidth = 1;
          ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }

  private static drawGrassOverlay(ctx: CanvasRenderingContext2D, map: TileType[][]): void {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === TileType.GRASS) {
          ctx.fillStyle = COLORS.GRASS;
          ctx.globalAlpha = 0.6;
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.globalAlpha = 1.0;
        }
      }
    }
  }

  private static drawBase(ctx: CanvasRenderingContext2D, base: { position: { x: number; y: number }; isDestroyed: boolean }): void {
    const { x, y } = base.position;
    const pixelX = x * TILE_SIZE;
    const pixelY = y * TILE_SIZE;
    
    ctx.fillStyle = base.isDestroyed ? '#FF0000' : COLORS.BASE;
    ctx.fillRect(pixelX, pixelY, TILE_SIZE * 2, TILE_SIZE * 2);
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(pixelX, pixelY, TILE_SIZE * 2, TILE_SIZE * 2);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(pixelX + 8, pixelY + 8, 16, 16);
  }

  private static drawTank(ctx: CanvasRenderingContext2D, tank: Tank): void {
    const { x, y } = tank.position;
    
    if (tank.isSpawning && Math.floor(tank.spawnTimer / 10) % 2 === 0) {
      return;
    }
    
    const color = this.getTankColor(tank);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, TANK_SIZE, TANK_SIZE);
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, TANK_SIZE, TANK_SIZE);
    
    if (tank.hasShield) {
      ctx.strokeStyle = COLORS.SHIELD;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + TANK_SIZE / 2, y + TANK_SIZE / 2, TANK_SIZE / 2 + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.fillStyle = '#000000';
    const barrelLength = 12;
    const barrelWidth = 4;
    const centerX = x + TANK_SIZE / 2;
    const centerY = y + TANK_SIZE / 2;
    
    switch (tank.direction) {
      case 'up':
        ctx.fillRect(centerX - barrelWidth / 2, y - barrelLength, barrelWidth, barrelLength + 4);
        break;
      case 'down':
        ctx.fillRect(centerX - barrelWidth / 2, y + TANK_SIZE - 4, barrelWidth, barrelLength + 4);
        break;
      case 'left':
        ctx.fillRect(x - barrelLength, centerY - barrelWidth / 2, barrelLength + 4, barrelWidth);
        break;
      case 'right':
        ctx.fillRect(x + TANK_SIZE - 4, centerY - barrelWidth / 2, barrelLength + 4, barrelWidth);
        break;
    }
  }

  private static drawExplosions(ctx: CanvasRenderingContext2D, explosions: Explosion[]): void {
    explosions.forEach(explosion => {
      const progress = explosion.frame / explosion.maxFrames;
      const radius = 16 * (1 + progress);
      const colorIndex = Math.floor(progress * (COLORS.EXPLOSION.length - 1));
      
      ctx.fillStyle = COLORS.EXPLOSION[colorIndex];
      ctx.globalAlpha = 1 - progress;
      ctx.beginPath();
      ctx.arc(explosion.position.x, explosion.position.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
  }

  private static drawPowerUps(ctx: CanvasRenderingContext2D, powerUps: PowerUp[]): void {
    powerUps.forEach(powerUp => {
      const { x, y } = powerUp.position;
      const time = Date.now() / 200;
      const pulse = Math.sin(time) * 0.2 + 1;
      
      let color: string;
      switch (powerUp.type) {
        case 'shield':
          color = COLORS.POWERUP_SHIELD;
          break;
        case 'rapidFire':
          color = COLORS.POWERUP_RAPIDFIRE;
          break;
        case 'extraLife':
          color = COLORS.POWERUP_LIFE;
          break;
      }
      
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(x - 12 * pulse, y - 12 * pulse, 24 * pulse, 24 * pulse);
      ctx.globalAlpha = 1.0;
      
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 12 * pulse, y - 12 * pulse, 24 * pulse, 24 * pulse);
    });
  }

  private static drawBullets(ctx: CanvasRenderingContext2D, bullets: Bullet[]): void {
    bullets.forEach(bullet => {
      ctx.fillStyle = COLORS.BULLET;
      ctx.fillRect(
        bullet.position.x - BULLET_SIZE / 2,
        bullet.position.y - BULLET_SIZE / 2,
        BULLET_SIZE,
        BULLET_SIZE
      );
      
      ctx.strokeStyle = '#FF8800';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        bullet.position.x - BULLET_SIZE / 2,
        bullet.position.y - BULLET_SIZE / 2,
        BULLET_SIZE,
        BULLET_SIZE
      );
    });
  }

  private static getTileColor(tile: TileType): string {
    switch (tile) {
      case TileType.BRICK: return COLORS.BRICK;
      case TileType.STEEL: return COLORS.STEEL;
      case TileType.WATER: return COLORS.WATER;
      case TileType.GRASS: return COLORS.GRASS;
      case TileType.BASE: return COLORS.BASE;
      default: return COLORS.EMPTY;
    }
  }

  private static getTankColor(tank: Tank): string {
    if (tank.type === 'player') {
      return tank.playerNumber === 2 ? COLORS.PLAYER2_TANK : COLORS.PLAYER_TANK;
    }
    
    switch (tank.enemyType) {
      case 'basic': return COLORS.ENEMY_BASIC;
      case 'fast': return COLORS.ENEMY_FAST;
      case 'armored': return COLORS.ENEMY_ARMORED;
      default: return COLORS.ENEMY_BASIC;
    }
  }
}