import { PowerUpType } from '../types/game';
import { POWERUP_DROP_CHANCE } from '../constants/config';

const ALL_POWERUPS = [
  PowerUpType.SHIELD,
  PowerUpType.SPEED,
  PowerUpType.FIREPOWER,
  PowerUpType.EXTRA_LIFE,
  PowerUpType.BOMB,
  PowerUpType.TIME_FREEZE,
];

/**
 * Determine if a powerup should drop when an enemy is killed.
 */
export function shouldDropPowerUp(enemyHasPowerUp: boolean): boolean {
  if (enemyHasPowerUp) return true;
  return Math.random() < POWERUP_DROP_CHANCE;
}

/**
 * Get a random powerup type with weighted probabilities.
 */
export function getRandomPowerUpType(): PowerUpType {
  const weights: Record<PowerUpType, number> = {
    [PowerUpType.SHIELD]: 25,
    [PowerUpType.SPEED]: 20,
    [PowerUpType.FIREPOWER]: 20,
    [PowerUpType.EXTRA_LIFE]: 10,
    [PowerUpType.BOMB]: 15,
    [PowerUpType.TIME_FREEZE]: 10,
  };

  const totalWeight = ALL_POWERUPS.reduce((sum, p) => sum + weights[p], 0);
  let rand = Math.random() * totalWeight;

  for (const powerUp of ALL_POWERUPS) {
    rand -= weights[powerUp];
    if (rand <= 0) return powerUp;
  }

  return PowerUpType.SHIELD;
}

/**
 * Get random position on the map for powerup spawn.
 */
export function getRandomPowerUpPosition(
  mapWidth: number,
  mapHeight: number,
  margin: number = 48,
): { x: number; y: number } {
  return {
    x: margin + Math.random() * (mapWidth - margin * 2),
    y: margin + Math.random() * (mapHeight - margin * 2),
  };
}
