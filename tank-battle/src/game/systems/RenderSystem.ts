import type { GameState, Tank, Bullet } from '../types';
import { TileType } from '../types';
import { TILE_SIZE, TANK_SIZE, BULLET_SIZE, COLORS } from '../constants';

export class RenderSystem {
  static render(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    this.clearCanvas(ctx);
    this.drawMap(ctx, gameState.map);
    this.drawBase(ctx, gameState.base);
    this.drawBullets(ctx, gameState.bullets);
    if (gameState.player) {
      this.drawTank(ctx, gameState.player);
    }
    gameState.enemies.forEach(enemy => {
      this.drawTank(ctx, enemy);
    });
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
      return COLORS.PLAYER_TANK;
    }
    
    switch (tank.enemyType) {
      case 'basic': return COLORS.ENEMY_BASIC;
      case 'fast': return COLORS.ENEMY_FAST;
      case 'armored': return COLORS.ENEMY_ARMORED;
      default: return COLORS.ENEMY_BASIC;
    }
  }
}