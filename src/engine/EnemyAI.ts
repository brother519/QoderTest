import type { EnemyTank } from '../types/game';
import { Direction, EnemyType } from '../types/game';
import { ENEMY_CONFIG, BOSS_PHASE_2_HEALTH_RATIO, BOSS_PHASE_3_HEALTH_RATIO } from '../constants/config';

/**
 * Decide a new random direction for an enemy.
 * Has bias toward player position.
 */
export function decideDirection(
  enemy: EnemyTank,
  playerX: number | null,
  playerY: number | null,
): Direction {
  const dirs = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];

  // 30% random, 70% toward player (if player exists)
  if (playerX !== null && playerY !== null && Math.random() > 0.3) {
    const dx = playerX - enemy.x;
    const dy = playerY - enemy.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? Direction.RIGHT : Direction.LEFT;
    } else {
      return dy > 0 ? Direction.DOWN : Direction.UP;
    }
  }

  return dirs[Math.floor(Math.random() * dirs.length)];
}

/**
 * Determine AI direction change interval based on enemy type.
 */
export function getAIDirectionInterval(type: EnemyType): number {
  switch (type) {
    case EnemyType.BASIC: return 1500 + Math.random() * 2000;
    case EnemyType.FAST: return 800 + Math.random() * 1200;
    case EnemyType.HEAVY: return 2000 + Math.random() * 3000;
    case EnemyType.ARTILLERY: return 3000 + Math.random() * 4000;
    case EnemyType.BOSS: return 1000 + Math.random() * 1500;
  }
}

/**
 * Determine if enemy should shoot this frame.
 */
export function shouldShoot(enemy: EnemyTank, dt: number): boolean {
  const config = ENEMY_CONFIG[enemy.enemyType];
  enemy.aiShootTimer -= dt;
  if (enemy.aiShootTimer <= 0) {
    enemy.aiShootTimer = config.fireRate * (0.7 + Math.random() * 0.6);
    return true;
  }
  return false;
}

/**
 * Boss AI: get current phase based on health ratio.
 * Phase 1: normal, Phase 2: faster + spread, Phase 3: berserk
 */
export function getBossPhase(enemy: EnemyTank): number {
  const ratio = enemy.health / enemy.maxHealth;
  if (ratio <= BOSS_PHASE_3_HEALTH_RATIO) return 3;
  if (ratio <= BOSS_PHASE_2_HEALTH_RATIO) return 2;
  return 1;
}

/**
 * Boss phase 2+: get additional bullet directions (spread shot).
 */
export function getBossExtraDirections(phase: number, baseDir: Direction): Direction[] {
  if (phase < 2) return [];
  const allDirs = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
  if (phase === 2) {
    // Shoot in perpendicular directions too
    return allDirs.filter(d => d !== baseDir).slice(0, 1);
  }
  // Phase 3: shoot in all directions
  return allDirs.filter(d => d !== baseDir);
}

/**
 * Get boss speed multiplier based on phase.
 */
export function getBossSpeedMultiplier(phase: number): number {
  switch (phase) {
    case 1: return 1;
    case 2: return 1.5;
    case 3: return 2;
    default: return 1;
  }
}

/**
 * Get boss fire rate multiplier (lower = faster).
 */
export function getBossFireRateMultiplier(phase: number): number {
  switch (phase) {
    case 1: return 1;
    case 2: return 0.6;
    case 3: return 0.35;
    default: return 1;
  }
}
