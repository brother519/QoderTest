import Item from './Item.js';

class FireFlower extends Item {
  constructor(scene, x, y) {
    super(scene, x, y, 'fireflower');
    this.body.setAllowGravity(false);
    
    scene.tweens.add({
      targets: this,
      alpha: 0.7,
      duration: 300,
      yoyo: true,
      repeat: -1
    });
  }
  
  collect(player) {
    player.powerUp('fireflower');
    super.collect(player);
  }
}

export default FireFlower;
