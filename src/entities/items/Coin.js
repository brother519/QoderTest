import Item from './Item.js';

class Coin extends Item {
  constructor(scene, x, y) {
    super(scene, x, y, 'coin');
    this.body.setAllowGravity(false);
    
    scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 2000,
      repeat: -1
    });
  }
  
  collect(player) {
    if (player.scene && player.scene.scoreManager) {
      player.scene.scoreManager.addCoin();
    }
    super.collect(player);
  }
}

export default Coin;
