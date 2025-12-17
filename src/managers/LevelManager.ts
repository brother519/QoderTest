import Phaser from 'phaser';
import { LevelData } from '@/types/level.types';

export default class LevelManager {
  private scene: Phaser.Scene;
  private currentLevelId: number = 1;
  private totalLevels: number = 3;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  async loadLevel(levelId: number): Promise<LevelData | null> {
    try {
      const response = await fetch(`/assets/maps/levels/level${levelId}.json`);
      const levelData: LevelData = await response.json();
      this.currentLevelId = levelId;
      return levelData;
    } catch (error) {
      console.error(`Failed to load level ${levelId}:`, error);
      return null;
    }
  }

  getCurrentLevel(): number {
    return this.currentLevelId;
  }

  getNextLevel(): number | null {
    if (this.currentLevelId < this.totalLevels) {
      return this.currentLevelId + 1;
    }
    return null;
  }

  hasNextLevel(): boolean {
    return this.currentLevelId < this.totalLevels;
  }

  reset() {
    this.currentLevelId = 1;
  }
}
