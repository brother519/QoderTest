import Enemy from './Enemy.js';
import Constants from '../../config/Constants.js';

class Koopa extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'koopa');
    this.setVelocityX(Constants.ENEMY.KOOPA_SPEED);
    this.score = Constants.SCORE.KOOPA;
    this.inShell = false;
  }
  
  die() {
    if (this.isDying) return;
    
    if (!this.inShell) {
      this.inShell = true;
      this.setTexture('koopa_shell');
      this.setVelocityX(0);
      this.setSize(16, 16);
    } else {
      super.die();
    }
  }
}

export default Koopa;
