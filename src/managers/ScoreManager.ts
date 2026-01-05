import Phaser from 'phaser';

export default class ScoreManager {
  private currentScore: number;
  private highScores: { name: string; score: number }[];

  constructor() {
    this.currentScore = 0;
    this.highScores = this.loadHighScores();
  }

  addScore(points: number) {
    this.currentScore += points;
  }

  getCurrentScore(): number {
    return this.currentScore;
  }

  getHighScore(): number {
    if (this.highScores.length > 0) {
      return Math.max(...this.highScores.map(item => item.score));
    }
    return 0;
  }

  getCurrentScoreText(): string {
    return `Score: ${this.currentScore}`;
  }

  getHighScoreText(): string {
    const highScore = this.getHighScore();
    return `High Score: ${highScore}`;
  }

  saveScore(name: string = 'Player') {
    const newScore = { name, score: this.currentScore };
    this.highScores.push(newScore);
    
    // 只保留前10名
    this.highScores.sort((a, b) => b.score - a.score);
    this.highScores = this.highScores.slice(0, 10);
    
    // 保存到localStorage
    localStorage.setItem('planeWarHighScores', JSON.stringify(this.highScores));
  }

  private loadHighScores(): { name: string; score: number }[] {
    const saved = localStorage.getItem('planeWarHighScores');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading high scores:', e);
      }
    }
    return [];
  }

  getHighScores(): { name: string; score: number }[] {
    return [...this.highScores]; // 返回副本
  }

  reset() {
    this.currentScore = 0;
  }
}
