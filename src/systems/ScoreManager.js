import Constants from '../config/Constants.js';

class ScoreManager {
  constructor() {
    this.score = 0;
    this.coins = 0;
    this.lives = Constants.GAME.INITIAL_LIVES;
  }
  
  addScore(points) {
    this.score += points;
  }
  
  addCoin() {
    this.coins += 1;
    this.score += Constants.SCORE.COIN;
    
    if (this.coins >= Constants.SCORE.COINS_FOR_LIFE) {
      this.coins = 0;
      this.lives += 1;
    }
  }
  
  addLife() {
    this.lives += 1;
  }
  
  loseLife() {
    this.lives -= 1;
  }
  
  reset() {
    this.score = 0;
    this.coins = 0;
    this.lives = Constants.GAME.INITIAL_LIVES;
  }
}

export default ScoreManager;
