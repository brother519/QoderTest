import type {
  GameState, PlayerTank, EnemyTank, Bullet, PowerUp, Explosion, Particle, SpawnEffect,
} from '../types/game';
import { GamePhase, TileType, Direction, EnemyType, PowerUpType } from '../types/game';
import * as C from '../constants/config';

/**
 * Canvas rendering engine for the Super Tank Battle game.
 * Handles all drawing: terrain, tanks, bullets, effects, HUD, and screen overlays.
 */
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private waterFrame: number = 0;
  private waterTimer: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Main render entry point. Dispatches to phase-specific drawing methods.
   * @param state - Current game state to render
   * @param dt - Delta time in milliseconds for animations
   */
  render(state: GameState, dt: number): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);

    switch (state.phase) {
      case GamePhase.START_SCREEN:
        this.drawStartScreen(state);
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

  /**
   * Draw the full game scene: terrain, entities, effects, and HUD.
   * @param state - Current game state
   * @param dt - Delta time in milliseconds
   */
  private drawGame(state: GameState, dt: number): void {
    this.ctx.fillStyle = C.COLORS.background;
    this.ctx.fillRect(0, 0, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);

    this.waterTimer += dt;
    if (this.waterTimer > 500) {
      this.waterTimer = 0;
      this.waterFrame = (this.waterFrame + 1) % 2;
    }

    this.drawTerrainBottom(state.mapData);
    this.drawTerrainSolid(state);

    for (const pu of state.powerUps) {
      this.drawPowerUp(pu);
    }

    for (const se of state.spawnEffects) {
      this.drawSpawnEffect(se);
    }

    for (const enemy of state.enemies) {
      if (enemy.spawnAnimation > 0) continue;
      this.drawEnemyTank(enemy);
    }

    // Draw all players
    for (const player of state.players) {
      if (!player.isRespawning && player.spawnAnimation <= 0) {
        this.drawPlayerTank(player);
      }
    }

    for (const bullet of state.bullets) {
      this.drawBullet(bullet);
    }

    this.drawTreesOverlay(state.mapData);

    for (const exp of state.explosions) {
      this.drawExplosion(exp);
    }

    for (const particle of state.particles) {
      this.drawParticle(particle);
    }

    this.drawHUD(state);
  }

  // ============ TERRAIN ============

  /**
   * Draw bottom-layer terrain tiles: ice and water with animations.
   * @param mapData - The 26x26 tile grid
   */
  private drawTerrainBottom(mapData: number[][]): void {
    const ctx = this.ctx;
    for (let row = 0; row < C.MAP_ROWS; row++) {
      for (let col = 0; col < C.MAP_COLS; col++) {
        const tile = mapData[row]?.[col];
        const x = col * C.TILE_SIZE;
        const y = row * C.TILE_SIZE;

        if (tile === TileType.ICE) {
          this.drawIceTile(x, y);
        } else if (tile === TileType.WATER) {
          this.drawWaterTile(x, y);
        }
      }
    }
  }

  /**
   * Draw an ice tile with cross-hatch shine pattern.
   * @param x - Pixel X position
   * @param y - Pixel Y position
   */
  private drawIceTile(x: number, y: number): void {
    const ctx = this.ctx;
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
  }

  /**
   * Draw a water tile with animated wave pattern.
   * @param x - Pixel X position
   * @param y - Pixel Y position
   */
  private drawWaterTile(x: number, y: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = C.COLORS.water;
    ctx.fillRect(x, y, C.TILE_SIZE, C.TILE_SIZE);
    ctx.fillStyle = C.COLORS.waterWave;
    const offset = this.waterFrame * 4;
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x + offset + i * 8, y + 4 + i * 7, 6, 2);
    }
  }

  /**
   * Draw solid terrain layer: bricks, steel, and base.
   * @param state - Game state for mapData and baseDestroyed
   */
  private drawTerrainSolid(state: GameState): void {
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
  }

  /**
   * Draw a brick tile with mortar line pattern.
   * @param x - Pixel X position
   * @param y - Pixel Y position
   */
  private drawBrick(x: number, y: number): void {
    const ctx = this.ctx;
    const s = C.TILE_SIZE;
    ctx.fillStyle = C.COLORS.brick;
    ctx.fillRect(x, y, s, s);
    ctx.strokeStyle = C.COLORS.brickLine;
    ctx.lineWidth = 0.5;
    const half = s / 2;
    ctx.strokeRect(x, y, half, half / 2);
    ctx.strokeRect(x + half, y, half, half / 2);
    ctx.strokeRect(x + half / 2, y + half / 2, half, half / 2);
    ctx.strokeRect(x, y + half, half, half / 2);
    ctx.strokeRect(x + half, y + half, half, half / 2);
    ctx.strokeRect(x + half / 2, y + half + half / 2, half, half / 2);
  }

  /**
   * Draw a steel tile with metal shine effect.
   * @param x - Pixel X position
   * @param y - Pixel Y position
   */
  private drawSteel(x: number, y: number): void {
    const ctx = this.ctx;
    const s = C.TILE_SIZE;
    ctx.fillStyle = C.COLORS.steel;
    ctx.fillRect(x, y, s, s);
    ctx.strokeStyle = C.COLORS.steelShine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 2);
    ctx.lineTo(x + s - 2, y + s - 2);
    ctx.stroke();
    ctx.strokeStyle = '#888888';
    ctx.strokeRect(x + 1, y + 1, s - 2, s - 2);
  }

  /**
   * Draw the base tile (eagle/flag icon or destroyed indicator).
   * @param x - Pixel X position
   * @param y - Pixel Y position
   * @param isDestroyed - Whether the base has been destroyed
   */
  private drawBase(x: number, y: number, isDestroyed: boolean): void {
    const ctx = this.ctx;
    const s = C.TILE_SIZE;
    if (isDestroyed) {
      ctx.fillStyle = C.COLORS.baseDestroyed;
      ctx.fillRect(x, y, s, s);
    } else {
      ctx.fillStyle = C.COLORS.base;
      ctx.fillRect(x, y, s, s);
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

  /**
   * Draw tree canopy overlay on top of all other entities.
   * @param mapData - The 26x26 tile grid
   */
  private drawTreesOverlay(mapData: number[][]): void {
    const ctx = this.ctx;
    for (let row = 0; row < C.MAP_ROWS; row++) {
      for (let col = 0; col < C.MAP_COLS; col++) {
        if (mapData[row]?.[col] === TileType.TREES) {
          const x = col * C.TILE_SIZE;
          const y = row * C.TILE_SIZE;
          const s = C.TILE_SIZE;
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

  /**
   * Draw a player tank with per-player colors and shield effect.
   * @param player - The player tank to render
   */
  private drawPlayerTank(player: PlayerTank): void {
    const ctx = this.ctx;
    const colors = C.PLAYER_COLORS[player.playerIndex];
    this.drawTankBody(
      player.x, player.y, player.width, player.height,
      player.direction, colors.body, colors.turret, colors.track,
    );

    if (player.hasShield) {
      this.drawShieldEffect(player);
    }
  }

  /**
   * Draw the animated shield bubble around a player.
   * @param player - The shielded player tank
   */
  private drawShieldEffect(player: PlayerTank): void {
    const ctx = this.ctx;
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

  /**
   * Draw an enemy tank with type-specific colors, flash, and boss health bar.
   * @param enemy - The enemy tank to render
   */
  private drawEnemyTank(enemy: EnemyTank): void {
    const config = C.ENEMY_CONFIG[enemy.enemyType];

    let bodyColor = config.bodyColor;
    let turretColor = config.color;
    if (enemy.hasPowerUp && Math.floor(Date.now() / 150) % 2 === 0) {
      bodyColor = '#FF0000';
      turretColor = '#FFFF00';
    }

    if (enemy.frozen) {
      bodyColor = '#6688AA';
      turretColor = '#88AACC';
    }

    this.drawTankBody(
      enemy.x, enemy.y, enemy.width, enemy.height,
      enemy.direction, bodyColor, turretColor, '#333333',
    );

    if (enemy.enemyType === EnemyType.BOSS) {
      this.drawHealthBar(
        enemy.x, enemy.y - 8,
        enemy.width, 4,
        enemy.health / enemy.maxHealth,
      );
    }
  }

  /**
   * Draw a generic tank body with tracks, hull, turret, and barrel.
   * @param x - Top-left X position
   * @param y - Top-left Y position
   * @param w - Tank width
   * @param h - Tank height
   * @param dir - Facing direction
   * @param bodyColor - Hull fill color
   * @param turretColor - Turret and barrel fill color
   * @param trackColor - Track fill color
   */
  private drawTankBody(
    x: number, y: number, w: number, h: number,
    dir: Direction, bodyColor: string, turretColor: string, trackColor: string,
  ): void {
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

    ctx.fillStyle = trackColor;
    ctx.fillRect(-hw, -hh, w * 0.2, h);
    ctx.fillRect(hw - w * 0.2, -hh, w * 0.2, h);

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

    ctx.fillStyle = bodyColor;
    ctx.fillRect(-hw + w * 0.2, -hh + h * 0.1, w * 0.6, h * 0.8);

    ctx.fillStyle = turretColor;
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = turretColor;
    ctx.fillRect(-w * 0.06, -hh - 2, w * 0.12, hh + 2);

    ctx.restore();
  }

  /**
   * Draw a horizontal health bar (used for boss enemies).
   * @param x - Left X position
   * @param y - Top Y position
   * @param w - Bar width
   * @param h - Bar height
   * @param ratio - Health ratio 0..1
   */
  private drawHealthBar(x: number, y: number, w: number, h: number, ratio: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#333333';
    ctx.fillRect(x, y, w, h);
    const color = ratio > 0.5 ? '#44FF44' : ratio > 0.25 ? '#FFAA00' : '#FF2222';
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w * ratio, h);
  }

  // ============ BULLET ============

  /**
   * Draw a bullet with a glowing halo effect.
   * @param bullet - The bullet entity to render
   */
  private drawBullet(bullet: Bullet): void {
    const ctx = this.ctx;
    const cx = bullet.x + bullet.width / 2;
    const cy = bullet.y + bullet.height / 2;

    ctx.fillStyle = bullet.isPlayerBullet ? '#FFFF00' : '#FF6600';
    ctx.beginPath();
    ctx.arc(cx, cy, C.BULLET_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = bullet.isPlayerBullet ? 'rgba(255,255,0,0.3)' : 'rgba(255,100,0,0.3)';
    ctx.beginPath();
    ctx.arc(cx, cy, C.BULLET_SIZE, 0, Math.PI * 2);
    ctx.fill();
  }

  // ============ POWERUP ============

  /**
   * Draw a power-up item with flash effect when expiring.
   * @param pu - The power-up entity to render
   */
  private drawPowerUp(pu: PowerUp): void {
    const ctx = this.ctx;
    const isVisible = Math.floor(pu.flashTimer / 200) % 2 === 0;
    if (!isVisible && pu.timer < 3000) return;

    const x = pu.x;
    const y = pu.y;
    const s = pu.width;

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(x - 2, y - 2, s + 4, s + 4);

    ctx.fillStyle = C.POWERUP_COLORS[pu.type];
    ctx.fillRect(x, y, s, s);

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

  /**
   * Draw an explosion circle with bright core.
   * @param exp - The explosion to render
   */
  private drawExplosion(exp: Explosion): void {
    const ctx = this.ctx;
    const progress = 1 - exp.timer / exp.maxTimer;
    const alpha = 1 - progress;

    ctx.beginPath();
    ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
    ctx.fillStyle = exp.isBig
      ? `rgba(255, 68, 0, ${alpha})`
      : `rgba(255, 170, 0, ${alpha})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(exp.x, exp.y, exp.radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 200, ${alpha * 0.8})`;
    ctx.fill();
  }

  /**
   * Draw a fading debris particle.
   * @param p - The particle to render
   */
  private drawParticle(p: Particle): void {
    const ctx = this.ctx;
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    ctx.globalAlpha = 1;
  }

  /**
   * Draw a flashing star spawn effect at a tank spawn point.
   * @param se - The spawn effect to render
   */
  private drawSpawnEffect(se: SpawnEffect): void {
    const ctx = this.ctx;
    const progress = 1 - se.timer / se.maxTimer;
    const size = C.TANK_SIZE * (0.5 + Math.abs(Math.sin(progress * Math.PI * 4)) * 0.5);

    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress})`;
    ctx.lineWidth = 2;
    ctx.save();
    ctx.translate(se.x, se.y);
    ctx.rotate(progress * Math.PI * 2);

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

  /**
   * Draw the heads-up display bar at the top of the screen.
   * Adapts layout for single-player vs two-player mode.
   * @param state - Current game state
   */
  private drawHUD(state: GameState): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, C.CANVAS_WIDTH, 28);

    ctx.font = 'bold 14px monospace';
    ctx.textBaseline = 'middle';

    const remaining = state.enemySpawnQueue.length + state.enemies.length;

    if (state.gameMode === 2) {
      this.drawTwoPlayerHUD(state, remaining);
    } else {
      this.drawSinglePlayerHUD(state, remaining);
    }

    if (state.freezeTimer > 0) {
      ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
      ctx.fillRect(0, 28, C.CANVAS_WIDTH, C.CANVAS_HEIGHT - 28);
    }
  }

  /**
   * Draw single-player HUD layout: SCORE | STAGE | LIVES | ENEMIES.
   * @param state - Current game state
   * @param remaining - Remaining enemy count
   */
  private drawSinglePlayerHUD(state: GameState, remaining: number): void {
    const ctx = this.ctx;

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${state.scores[0]}`, 8, 14);

    ctx.textAlign = 'center';
    ctx.fillText(`STAGE ${state.currentLevel + 1}`, C.CANVAS_WIDTH / 2, 14);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#44FF44';
    ctx.fillText(`♥ ${state.lives[0]}`, C.CANVAS_WIDTH - 100, 14);

    ctx.fillStyle = '#FF6666';
    ctx.fillText(`E: ${remaining}`, C.CANVAS_WIDTH - 8, 14);
  }

  /**
   * Draw two-player HUD layout: P1 info | STAGE + ENEMIES | P2 info.
   * @param state - Current game state
   * @param remaining - Remaining enemy count
   */
  private drawTwoPlayerHUD(state: GameState, remaining: number): void {
    const ctx = this.ctx;

    // P1 info (left)
    ctx.textAlign = 'left';
    ctx.fillStyle = C.PLAYER_COLORS[0].turret;
    ctx.fillText(`P1`, 8, 14);
    ctx.fillStyle = '#44FF44';
    ctx.fillText(`♥${state.lives[0]}`, 36, 14);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${state.scores[0]}`, 72, 14);

    // Center: stage + enemies
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`STAGE ${state.currentLevel + 1}`, C.CANVAS_WIDTH / 2 - 30, 14);
    ctx.fillStyle = '#FF6666';
    ctx.fillText(`E:${remaining}`, C.CANVAS_WIDTH / 2 + 40, 14);

    // P2 info (right)
    ctx.textAlign = 'right';
    ctx.fillStyle = C.PLAYER_COLORS[1].turret;
    ctx.fillText(`P2`, C.CANVAS_WIDTH - 150, 14);
    ctx.fillStyle = '#44FF44';
    ctx.fillText(`♥${state.lives[1] ?? 0}`, C.CANVAS_WIDTH - 122, 14);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${state.scores[1] ?? 0}`, C.CANVAS_WIDTH - 8, 14);
  }

  // ============ SCREENS ============

  /**
   * Draw the start screen with title, tank art, and mode selection menu.
   * @param state - Current game state (for menuSelection)
   */
  private drawStartScreen(state: GameState): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);

    // Title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SUPER TANK', C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 - 80);
    ctx.fillStyle = '#FF4400';
    ctx.fillText('BATTLE', C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 - 35);

    // Tank art
    this.drawTankBody(
      C.CANVAS_WIDTH / 2 - 30, C.CANVAS_HEIGHT / 2 + 5, 60, 60,
      Direction.UP, '#33AA33', '#55DD55', '#225522',
    );

    // Mode selection menu
    this.drawModeMenu(state.menuSelection, C.CANVAS_HEIGHT / 2 + 90);

    // Controls info
    ctx.fillStyle = '#888888';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('P1: WASD + SPACE | P2: ARROWS + ENTER', C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT - 40);
    ctx.fillText('P/ESC: Pause', C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT - 22);
  }

  /**
   * Draw the 1P / 2P mode selection menu on the start screen.
   * @param selection - Currently highlighted option (1 or 2)
   * @param baseY - Y position for the first menu item
   */
  private drawModeMenu(selection: 1 | 2, baseY: number): void {
    const ctx = this.ctx;
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';

    const isOneP = selection === 1;

    // 1 PLAYER option
    ctx.fillStyle = isOneP ? '#FFFFFF' : '#666666';
    ctx.fillText(
      `${isOneP ? '▶ ' : '  '}1 PLAYER`,
      C.CANVAS_WIDTH / 2, baseY,
    );

    // 2 PLAYERS option
    ctx.fillStyle = !isOneP ? '#FFFFFF' : '#666666';
    ctx.fillText(
      `${!isOneP ? '▶ ' : '  '}2 PLAYERS`,
      C.CANVAS_WIDTH / 2, baseY + 30,
    );
  }

  /**
   * Draw the stage intro overlay showing level number and enemy count.
   * @param state - Current game state
   */
  private drawStageIntro(state: GameState): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#555555';
    ctx.fillRect(0, 0, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`STAGE ${state.currentLevel + 1}`, C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2);

    ctx.fillStyle = '#CCCCCC';
    ctx.font = '16px monospace';
    ctx.fillText(
      `Enemies: ${state.enemySpawnQueue.length}`,
      C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 + 40,
    );

    if (state.gameMode === 2) {
      ctx.fillStyle = '#AACCFF';
      ctx.fillText('2 PLAYERS', C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 + 65);
    }
  }

  /** Draw the semi-transparent pause overlay with instructions. */
  private drawPauseOverlay(): void {
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

  /**
   * Draw the level complete overlay showing scores.
   * @param state - Current game state
   */
  private drawLevelComplete(state: GameState): void {
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
    if (state.gameMode === 2) {
      ctx.fillText(
        `P1: ${state.scores[0]}  P2: ${state.scores[1] ?? 0}`,
        C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 + 20,
      );
    } else {
      ctx.fillText(`Score: ${state.scores[0]}`, C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 + 20);
    }
  }

  /**
   * Draw the game over overlay showing final scores and restart prompt.
   * @param state - Current game state
   */
  private drawGameOver(state: GameState): void {
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
    if (state.gameMode === 2) {
      ctx.fillText(
        `P1: ${state.scores[0]}  P2: ${state.scores[1] ?? 0}`,
        C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 + 20,
      );
    } else {
      ctx.fillText(`Final Score: ${state.scores[0]}`, C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 + 20);
    }

    const isFlashing = Math.floor(Date.now() / 500) % 2 === 0;
    if (isFlashing) {
      ctx.font = '16px monospace';
      ctx.fillText('Press ENTER to restart', C.CANVAS_WIDTH / 2, C.CANVAS_HEIGHT / 2 + 60);
    }
  }
}
