import Phaser from 'phaser';
import { LEVEL_UP_SCORE } from '../utils/Constants';
import { ILevelConfig, EnemyType } from '../utils/Types';
import { LEVEL_DATA } from '../data/GameData';

export default class LevelManager {
  private currentLevel: number;
  private currentScore: number;
  private onLevelUpCallback: (() => void) | null;

  constructor() {
    this.currentLevel = 1;
    this.currentScore = 0;
    this.onLevelUpCallback = null;
  }

  updateScore(score: number) {
    this.currentScore = score;
    
    // 检查是否升级
    const newLevel = this.calculateLevel();
    if (newLevel > this.currentLevel) {
      this.currentLevel = newLevel;
      if (this.onLevelUpCallback) {
        this.onLevelUpCallback();
      }
    }
  }

  private calculateLevel(): number {
    for (let i = LEVEL_DATA.length - 1; i >= 0; i--) {
      if (this.currentScore >= LEVEL_DATA[i].scoreThreshold) {
        return LEVEL_DATA[i].level;
      }
    }
    return 1;
  }

  getCurrentLevel(): number {
    return this.currentLevel;
  }

  getCurrentLevelConfig(): ILevelConfig {
    const levelIndex = Math.min(this.currentLevel - 1, LEVEL_DATA.length - 1);
    return LEVEL_DATA[levelIndex];
  }

  onLevelUp(callback: () => void) {
    this.onLevelUpCallback = callback;
  }

  reset() {
    this.currentLevel = 1;
    this.currentScore = 0;
  }
}