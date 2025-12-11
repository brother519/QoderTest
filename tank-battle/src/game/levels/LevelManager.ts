import { GameMap, TileType } from '../types';
import { LEVELS, LevelConfig } from './levelData';

export class LevelManager {
  static getLevel(levelNumber: number): LevelConfig | null {
    const level = LEVELS.find(l => l.levelNumber === levelNumber);
    return level || null;
  }

  static copyMap(map: GameMap): GameMap {
    return map.map(row => [...row]);
  }

  static findBasePosition(map: GameMap): { x: number; y: number } | null {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === TileType.BASE) {
          return { x, y };
        }
      }
    }
    return null;
  }

  static getPlayerStartPosition(): { x: number; y: number } {
    return { x: 12 * 16, y: 24 * 16 };
  }

  static getEnemySpawnPositions(): Array<{ x: number; y: number }> {
    return [
      { x: 0 * 16, y: 0 * 16 },
      { x: 12 * 16, y: 0 * 16 },
      { x: 24 * 16, y: 0 * 16 },
    ];
  }

  static getTotalLevels(): number {
    return LEVELS.length;
  }
}
