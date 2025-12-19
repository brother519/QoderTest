import Item from './Item.js';
import Constants from '../../config/Constants.js';

class Mushroom extends Item {
  constructor(scene, x, y) {
    super(scene, x, y, 'mushroom');
    
    this.setVelocityY(Constants.ITEM.MUSHROOM_SPAWN_VELOCITY_Y);
    
    this.scene.time.delayedCall(500, () => {
      this.setVelocityX(Constants.ITEM.MUSHROOM_MOVE_SPEED);
    });
  }
  
  update() {
    if (this.body && (this.body.blocked.left || this.body.blocked.right)) {
      this.body.velocity.x *= -1;
    }
  }
  
  collect(player) {
    player.powerUp('mushroom');
    super.collect(player);
  }
}

export default Mushroom;
