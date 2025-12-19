import Enemy from './Enemy.js';
import Constants from '../../config/Constants.js';

class Goomba extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'goomba');
    this.setVelocityX(Constants.ENEMY.GOOMBA_SPEED);
    this.score = Constants.SCORE.GOOMBA;
  }
}

export default Goomba;
