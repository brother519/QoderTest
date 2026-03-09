import type {
  GameState, PlayerTank, EnemyTank, Bullet, PowerUp, Explosion, Particle, SpawnEffect,
} from '../types/game';
import { GamePhase, TileType, Direction, EnemyType, PowerUpType } from '../types/game';
import * as C from '../constants/config';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private waterFrame: number = 0;
  private waterTimer: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  render(state: GameState, dt: number) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);

    switch (state.phase) {
      case GamePhase.START_SCREEN:
        this.drawStartScreen();
        break;
      case GamePhase.STAGE_INTRO:
        this.drawStageIntro(state);
        break;
      case GamePhase.PLAYING:
      case GamePhase.PAUSED:
        this.drawGame(state, dt);
        if (state.phase === GamePhase.PAUSED) {
          this.drawPauseOverlay();
        }
        break;
      case GamePhase.LEVEL_COMPLETE:
        this.drawGame(state, dt);
        this.drawLevelComplete(state);
        break;
      case GamePhase.GAME_OVER:
        this.drawGame(state, dt);
        this.drawGameOver(state);
        break;
    }
  }

  // ============ GAME DRAWING ============

  private drawGame(state: GameState, dt: number) {
    this.ctx.fillStyle = C.COLORS.background;
    this.ctx.fillRect(0, 0, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);

    this.waterTimer += dt;
    if (this.waterTimer > 500) {
      this.waterTimer = 0;
      this.waterFrame = (this.waterFrame + 1) % 2;
    }

    // Draw terrain bottom layer (ice, water)
    this.drawTerrainBottom(state.mapData);

    // Draw terrain solid layer (brick, steel, base)
    this.drawTerrainSolid(state);

    // Draw powerups
    for (const pu of state.powerUps) {
      this.drawPowerUp(pu);
    }

    // Draw spawn effects
    for (const se of state.spawnEffects) {
      this.drawSpawnEffect(se);
    }

    // Draw enemies
    for (const enemy of state.enemies) {
      if (enemy.spawnAnimation > 0) continue;
      this.drawEnemyTank(enemy);
    }

    // Draw player
    if (state.player && !state.player.isRespawning) {
      if (state.player.spawnAnimation <= 0) {
        this.drawPlayerTank(state.player);
      }
    }

    // Draw bullets
    for (const bullet of state.bullets) {
      this.drawBullet(bullet);
    }

    // Draw trees on top (overlay)
    this.drawTreesOverlay(state.mapData);

    // Draw explosions
    for (const exp of state.explosions) {
      this.drawExplosion(exp);
    }

    // Draw particles
    for (const particle of state.particles) {
      this.drawParticle(particle);
    }

    // Draw HUD
    this.drawHUD(state);
  }

  // ============ TERRAIN ============

  private drawTerrainBottom(mapData: number[][]) {
    const ctx = this.ctx;
    for (let row = 0; row < C.MAP_ROWS; row++) {
      for (let col = 0; col < C.MAP_COLS; col++) {
        const tile = mapData[row]?.[col];
        const x = col * C.TILE_SIZE;
        const y = row * C.TILE_SIZE;

        if (tile === TileType.ICE) {
          ctx.fillStyle = C.COLORS.ice;
          ctx.fillRect(x, y, C.TILE_SIZE, C.TILE_SIZE);
          ctx.strokeStyle = C.COLORS.iceShine;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(x + 2, y + 2);
          ctx.lineTo(x + C.TILE_SIZE - 2, y + C.TILE_SIZE - 2);
          ctx.moveTo(x + C.TILE_SIZE - 2, y + 2);
          ctx.lineTo(x + 2, y + C.TILE_SIZE - 2);
          ctx.stroke();
        } else if (tile === TileType.WATER) {
          ctx.fillStyle = C.COLORS.water;
          ctx.fillRect(x, y, C.TILE_SIZE, C.TILE_SIZE);
          // Wave animation
          ctx.fillStyle = C.COLORS.waterWave;
          const offset = this.waterFrame * 4;
          for (let i = 0; i < 3; i++) {
            ctx.fillRect(x + offset + i * 8, y + 4 + i * 7, 6, 2);
          }
        }
      }
    }
  }

  private drawTerrainSolid(state: GameState) {
    const ctx = this.ctx;
    const mapData = state.mapData;

    for (let row = 0; row < C.MAP_ROWS; row++) {
      for (let col = 0; col < C.MAP_COLS; col++) {
        const tile = mapData[row]?.[col];
        const x = col * C.TILE_SIZE;
        const y = row * C.TILE_SIZE;

        if (tile === TileType.BRICK) {
          this.drawBrick(x, y);
        } else if (tile === TileType.STEEL) {
          this.drawSteel(x, y);
        } else if (tile === TileType.BASE) {
          this.drawBase(x, y, false);
        }
      }
    }

    // Draw destroyed base indicator
    if (state.baseDestroyed) {
      // Find base position from original level data - just draw at common position
    }
  }

  private drawBrick(x: number, y: number) {
    const ctx = this.ctx;
    const s = C.TILE_SIZE;
    ctx.fillStyle = C.COLORS.brick;
    ctx.fillRect(x, y, s, s);
    ctx.strokeStyle = C.COLORS.brickLine;
    ctx.lineWidth = 0.5;
    // Brick pattern
    const half = s / 2;
    ctx.strokeRect(x, y, half, half / 2);
    ctx.strokeRect(x + half, y, half, half / 2);
    ctx.strokeRect(x + half / 2, y + half / 2, half, half / 2);
    ctx.strokeRect(x, y + half, half, half / 2);
    ctx.strokeRect(x + half, y + half, half, half / 2);
    ctx.strokeRect(x + half / 2, y + half + half / 2, half, half / 2);
  }

  private drawSteel(x: number, y: number) {
    const ctx = this.ctx;
    const s = C.TILE_SIZE;
    ctx.fillStyle = C.COLORS.steel;
    ctx.fillRect(x, y, s, s);
    // Metal shine
    ctx.strokeStyle = C.COLORS.steelShine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 2);
    ctx.lineTo(x + s - 2, y + s - 2);
    ctx.stroke();
    ctx.strokeStyle = '#888888';
    ctx.strokeRect(x + 1, y + 1, s - 2, s - 2);
  }

  private drawBase(x: number, y: number, destroyed: boolean) {
    const ctx = this.ctx;
    const s = C.TILE_SIZE;
    if (destroyed) {
      ctx.fillStyle = C.COLORS.baseDestroyed;
      ctx.fillRect(x, y, s, s);
    } else {
      ctx.fillStyle = C.COLORS.base;
      ctx.fillRect(x, y, s, s);
      // Eagle/flag icon
      ctx.fillStyle = '#FFB000';
      ctx.beginPath();
      ctx.moveTo(x + s / 2, y + 3);
      ctx.lineTo(x + s - 3, y + s / 2);
      ctx.lineTo(x + s / 2, y + s - 3);
      ctx.lineTo(x + 3, y + s / 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#FF6600';
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s / 2, s / 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawTreesOverlay(mapData: number[][]) {
    const ctx = this.ctx;
    for (let row = 0; row < C.MAP_ROWS; row++) {
      for (let col = 0; col < C.MAP_COLS; col++) {
        if (mapData[row]?.[col] === TileType.TREES) {
          const x = col * C.TILE_SIZE;
          const y = row * C.TILE_SIZE;
          const s = C.TILE_SIZE;
          // Tree canopy clusters
          ctx.fillStyle = C.COLORS.trees;
          ctx.beginPath();
          ctx.arc(x + s * 0.3, y + s * 0.3, s * 0.3, 0, Math.PI * 2);
          ctx.arc(x + s * 0.7, y + s * 0.3, s * 0.3, 0, Math.PI * 2);
          ctx.arc(x + s * 0.5, y + s * 0.6, s * 0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = C.COLORS.treesDark;
          ctx.beginPath();
          ctx.arc(x + s * 0.5, y + s * 0.45, s * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // ============ TANKS ============

  private drawPlayerTank(player: PlayerTank) {
    const ctx = this.ctx;
    this.drawTankBody(
      player.x, player.y, player.width, player.height,
      player.direction, C.COLORS.playerBody, C.COLORS.playerTurret, C.COLORS.playerTrack,
    );

    // Shield effect
    if (player.hasShield) {
      ctx.strokeStyle = `rgba(0, 200, 255, ${0.5 + Math.sin(Date.now() / 100) * 0.3})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        player.x + player.width / 2,
        player.y + player.height / 2,
        player.width / 2 + 4,
        0, Math.PI * 2,
      );
      ctx.stroke();
    }
  }

  private drawEnemyTank(enemy: EnemyTank) {
    const config = C.ENEMY_CONFIG[enemy.enemyType];

    // Flash if has powerup
    let bodyColor = config.bodyColor;
    let turretColor = config.color;
    if (enemy.hasPowerUp && Math.floor(Date.now() / 150) % 2 === 0) {
      bodyColor = '#FF0000';
      turretColor = '#FFFF00';
    }

    // Frozen effect
    if (enemy.frozen) {
      bodyColor = '#6688AA';
      turretColor = '#88AACC';
    }

    this.drawTankBody(
      enemy.x, enemy.y, enemy.width, enemy.height,
      enemy.direction, bodyColor, turretColor, '#333333',
    );

    // Boss health bar
    if (enemy.enemyType === EnemyType.BOSS) {
      this.drawHealthBar(
        enemy.x, enemy.y - 8,
        enemy.width, 4,
        enemy.health / enemy.maxHealth,
      );
    }
  }

  private drawTankBody(
    x: number, y: number, w: number, h: number,
    dir: Direction, bodyColor: string, turretColor: string, trackColor: string,
  ) {
    const ctx = this.ctx;
    const cx = x + w / 2;
    const cy = y + h / 2;

    ctx.save();
    ctx.translate(cx, cy);

    let angle = 0;
    switch (dir) {
      case Direction.UP: angle = 0; break;
      case Direction.RIGHT: angle = Math.PI / 2; break;
      case Direction.DOWN: angle = Math.PI; break;
      case Direction.LEFT: angle = -Math.PI / 2; break;
    }
    ctx.rotate(angle);

    const hw = w / 2;
    const hh = h / 2;

    // Tracks
    ctx.fillStyle = trackColor;
    ctx.fillRect(-hw, -hh, w * 0.2, h);
    ctx.fillRect(hw - w * 0.2, -hh, w * 0.2, h);

    // Track details
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const ty = -hh + i * (h / 5) + h / 10;
      ctx.beginPath();
      ctx.moveTo(-hw, ty);
      ctx.lineTo(-hw + w * 0.2, ty);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hw - w * 0.2, ty);
      ctx.lineTo(hw, ty);
      ctx.stroke();
    }

    // Body
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-hw + w * 0.2, -hh + h * 0.1, w * 0.6, h * 0.8);

    // Turret base
    ctx.fillStyle = turretColor;
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Barrel
    ctx.fillStyle = turretColor;
    ctx.fillRect(-w * 0.06, -hh - 2, w * 0.12, hh + 2);

    ctx.restore();
  }

  private drawHealthBar(x: number, y: number, w: number, h: number, ratio: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#333333';
    ctx.fillRect(x, y, w, h);
    const color = ratio > 0.5 ? '#44FF44' : ratio > 0.25 ? '#FFAA00' : '#FF2222';
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w * ratio, h);
  }

  // ============ BULLET ============

  private drawBullet(bullet: Bullet) {
    const ctx = this.ctx;
    const cx = bullet.x + bullet.width / 2;
    const cy = bullet.y + bullet.height / 2;

    ctx.fillStyle = bullet.isPlayerBullet ? '#FFFF00' : '#FF6600';
    ctx.beginPath();
    ctx.arc(cx, cy, C.BULLET_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Glow
    ctx.fillStyle = bullet.isPlayerBullet ? 'rgba(255,255,0,0.3)' : 'rgba(255,100,0,0.3)';
    ctx.beginPath();
    ctx.arc(cx, cy, C.BULLET_SIZE, 0, Math.PI * 2);
    ctx.fill();
  }

  // ============ POWERUP ============

  private drawPowerUp(pu: PowerUp) {
    const ctx = this.ctx;
    const flash = Math.floor(pu.flashTimer / 200) % 2 === 0;
    if (!flash && pu.timer < 3000) return; // Flashing when about to expire

    const x = pu.x;
    const y = pu.y;
    const s = pu.width;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(x - 2, y - 2, s + 4, s + 4);

    ctx.fillStyle = C.POWERUP_COLORS[pu.type];
    ctx.fillRect(x, y, s, s);

    // Icon
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${s * 0.6}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icons: Record<PowerUpType, string> = {
      [PowerUpType.SHIELD]: 'S',
      [PowerUpType.SPEED]: '>',
      [PowerUpType.FIREPOWER]: 'F',
      [PowerUpType.EXTRA_LIFE]: '+',
      [PowerUpType.BOMB]: 'B',
      [PowerUpType.TIME_FREEZE]: '*',
    };
    ctx.fillText(icons[pu.type], x + s / 2, y + s / 2);
  }

  // ============ EFFECTS ============

  private drawExplosion(exp: Explosion) {
    const ctx = this.ctx;
    const progress = 1 - exp.timer / exp.maxTimer;

    // Outer ring
    ctx.beginPath();
    ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
    const alpha = 1 - progress;
    ctx.fillStyle = exp.isBig
      ? `rgba(255, 68, 0, ${alpha})`
      : `rgba(255, 170, 0, ${alpha})`;
    ctx.fill();

    // Inner bright core
    ctx.beginPath();
    ctx.arc(exp.x, exp.y, exp.radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 200, ${alpha * 0.8})`;
    ctx.fill();
  }

  private drawParticle(p: Particle) {
    const ctx = this.ctx;
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    ctx.globalAlpha = 1;
  }

  private drawSpawnEffect(se: SpawnEffect) {
    const ctx = this.ctx;
    const progress = 1 - se.timer / se.maxTimer;
    const size = C.TANK_SIZE * (0.5 + Math.abs(Math.sin(progress * Math.PI * 4)) * 0.5);

    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress})`;
    ctx.lineWidth = 2;
    ctx.save();
    ctx.translate(se.x, se.y);
    ctx.rotate(progress * Math.PI * 2);

    // Star shape
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * size / 2, Math.sin(angle) * size / 2);
    }
    ctx.stroke();

    ctx.strokeRect(-size / 2, -size / 2, size, size);
    ctx.restore();
  }

  // ============ HUD ============

  private drawHUD(state: GameState) {
    const ctx = this.ctx;
    // Semi-transparent HUD bar at top
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, C.CANVAS_WIDTH, 28);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Score
    ctx.fillText(`SCORE: ${state.score}`, 8, 14);

    // Stage
    ctx.textAlign = 'center';
    ctx.fillText(`STAGE ${state.currentLevel + 1}`, C.CANVAS_WIDTH / 2, 14);

    // Lives
    ctx.textAlign = 'right';
    ctx.fillStyle = '#44FF44';
    ctx.fillText(`♥ ${state.lives}`, C.CANVAS_WIDTH - 100, 14);

    // Enemies remaining
    ctx.fillStyle = '#FF6666';
    const remaining = state.enemySpawnQueue.length + state.enemies.length;
    ctx.fillText(`E: ${remaining}`, C.CANVAS_WIDTH - 8, 14);

    // Freeze indicator
    if (state.freezeTimer > 0) {
      ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
      ctx.fillRect(0, 28, C.CANVAS_WIDTH, C.CANVAS_HEIGHT - 28);
    }
  }

  // ============ SCREENS ============

  private drawStartScreen() {
    const ctx = this.ctx;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);

    // Title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SUPER TANK', C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 - 60);
    ctx.fillStyle = '#FF4400';
    ctx.fillText('BATTLE', C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 - 15);

    // Tank art
    this.drawTankBody(
      C.CANVAS_WIDTH / 2 - 30, C.CANVAS_HEIGHT / 2 + 20, 60, 60,
      Direction.UP, '#33AA33', '#55DD55', '#225522',
    );

    // Start prompt
    const flash = Math.floor(Date.now() / 500) % 2 === 0;
    if (flash) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '18px monospace';
      ctx.fillText('PRESS ENTER TO START', C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 + 120);
    }

    // Controls info
    ctx.fillStyle = '#888888';
    ctx.font = '12px monospace';
    ctx.fillText('ARROWS/WASD: Move | SPACE: Shoot | P/ESC: Pause', C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT - 30);
  }

  private drawStageIntro(state: GameState) {
    const ctx = this.ctx;
    ctx.fillStyle = '#555555';
    ctx.fillRect(0, 0, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`STAGE ${state.currentLevel + 1}`, C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2);

    // Enemy count
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '16px monospace';
    ctx.fillText(
      `Enemies: ${state.enemySpawnQueue.length}`,
      C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 + 40,
    );
  }

  private drawPauseOverlay() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSED', C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2);

    ctx.font = '16px monospace';
    ctx.fillText('Press P or ESC to resume', C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 + 40);
  }

  private drawLevelComplete(state: GameState) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('STAGE CLEAR!', C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 - 20);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px monospace';
    ctx.fillText(`Score: ${state.score}`, C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 + 20);
  }

  private drawGameOver(state: GameState) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);

    ctx.fillStyle = '#FF2222';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 - 30);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px monospace';
    ctx.fillText(`Final Score: ${state.score}`, C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 + 20);

    const flash = Math.floor(Date.now() / 500) % 2 === 0;
    if (flash) {
      ctx.font = '16px monospace';
      ctx.fillText('Press ENTER to restart', C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 + 60);
    }
  }
}
