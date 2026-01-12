import { Config } from '../utils/Config.js';

// 分数管理器
export class ScoreManager {
  constructor() {
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.combo = 0;
    this.lastPerfect = false;
    this.jumpCount = 0;
  }
  
  // 加载最高分
  loadHighScore() {
    try {
      return parseInt(localStorage.getItem('jumpGameHighScore')) || 0;
    } catch (e) {
      return 0;
    }
  }
  
  // 保存最高分
  saveHighScore() {
    try {
      localStorage.setItem('jumpGameHighScore', this.highScore.toString());
    } catch (e) {
      // 忽略localStorage错误
    }
  }
  
  // 成功落地得分
  landingScore(isPerfect) {
    this.jumpCount++;
    
    if (isPerfect) {
      this.combo++;
      this.score += Config.SCORE_PERFECT + this.combo;
      this.lastPerfect = true;
    } else {
      this.combo = 0;
      this.score += Config.SCORE_NORMAL;
      this.lastPerfect = false;
    }
    
    // 更新最高分
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    
    return {
      score: this.score,
      isPerfect,
      combo: this.combo
    };
  }
  
  // 检查是否需要增加难度
  shouldIncreaseDifficulty() {
    return this.jumpCount > 0 && this.jumpCount % Config.DIFFICULTY_INCREASE_INTERVAL === 0;
  }
  
  // 重置
  reset() {
    this.score = 0;
    this.combo = 0;
    this.lastPerfect = false;
    this.jumpCount = 0;
  }
  
  // 检查是否是新纪录
  isNewRecord() {
    return this.score >= this.highScore && this.score > 0;
  }
}
