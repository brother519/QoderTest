import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';

export default class Leaderboard {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private isVisible: boolean;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.isVisible = false;
    
    // 创建容器来管理排行榜UI元素
    this.container = scene.add.container(0, 0);
    this.container.setVisible(false);
    
    // 创建半透明背景
    const background = scene.add.rectangle(
      GAME_WIDTH / 2, 
      GAME_HEIGHT / 2, 
      GAME_WIDTH * 0.8, 
      GAME_HEIGHT * 0.8, 
      0x000000, 
      0.8
    );
    
    // 创建标题
    const title = scene.add.text(
      GAME_WIDTH / 2, 
      GAME_HEIGHT / 2 - 200, 
      '排行榜', 
      { 
        fontSize: '36px', 
        fill: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    // 添加到容器
    this.container.add([background, title]);
  }

  show() {
    this.updateScores();
    this.container.setVisible(true);
    this.isVisible = true;
  }

  hide() {
    this.container.setVisible(false);
    this.isVisible = false;
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  private updateScores() {
    // 移除现有的分数文本（除了标题）
    const children = this.container.list.slice(2); // 保留背景和标题
    children.forEach(child => child.destroy());
    
    // 获取分数数据
    const scores = this.getScores();
    
    // 显示分数
    for (let i = 0; i < Math.min(10, scores.length); i++) {
      const scoreText = this.scene.add.text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 - 150 + i * 40,
        `${i + 1}. ${scores[i].name}: ${scores[i].score}`,
        {
          fontSize: '24px',
          fill: '#ffffff'
        }
      ).setOrigin(0.5);
      
      this.container.add(scoreText);
    }
    
    // 如果没有分数
    if (scores.length === 0) {
      const noScoreText = this.scene.add.text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 - 150,
        '暂无记录',
        {
          fontSize: '24px',
          fill: '#ffffff'
        }
      ).setOrigin(0.5);
      
      this.container.add(noScoreText);
    }
  }

  private getScores(): { name: string; score: number }[] {
    const saved = localStorage.getItem('planeWarHighScores');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading high scores:', e);
        return [];
      }
    }
    return [];
  }
}