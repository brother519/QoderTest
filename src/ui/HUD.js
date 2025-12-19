import Phaser from 'phaser';

class HUD {
  constructor(scene) {
    this.scene = scene;
    
    this.scoreText = scene.add.text(16, 16, 'Score: 0', {
      fontSize: '18px',
      fill: '#fff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3
    }).setScrollFactor(0).setDepth(100);
    
    this.coinsText = scene.add.text(16, 40, 'Coins: 0', {
      fontSize: '18px',
      fill: '#fff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3
    }).setScrollFactor(0).setDepth(100);
    
    this.livesText = scene.add.text(16, 64, 'Lives: 3', {
      fontSize: '18px',
      fill: '#fff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3
    }).setScrollFactor(0).setDepth(100);
  }
  
  updateScore(score) {
    this.scoreText.setText('Score: ' + score);
  }
  
  updateCoins(coins) {
    this.coinsText.setText('Coins: ' + coins);
  }
  
  updateLives(lives) {
    this.livesText.setText('Lives: ' + lives);
  }
  
  update(scoreManager) {
    if (scoreManager) {
      this.updateScore(scoreManager.score);
      this.updateCoins(scoreManager.coins);
      this.updateLives(scoreManager.lives);
    }
  }
}

export default HUD;
