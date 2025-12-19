import Constants from '../config/Constants.js';

class CollisionManager {
  constructor(scene, player, enemyGroup, itemGroup, questionGroup, scoreManager) {
    this.scene = scene;
    this.player = player;
    this.enemyGroup = enemyGroup;
    this.itemGroup = itemGroup;
    this.questionGroup = questionGroup;
    this.scoreManager = scoreManager;
    
    this.setupCollisions();
  }
  
  setupCollisions() {
    this.scene.physics.add.overlap(
      this.player, 
      this.enemyGroup, 
      this.playerHitEnemy, 
      null, 
      this
    );
    
    this.scene.physics.add.overlap(
      this.player, 
      this.itemGroup, 
      this.collectItem, 
      null, 
      this
    );
    
    if (this.questionGroup) {
      this.scene.physics.add.collider(
        this.player, 
        this.questionGroup, 
        this.hitQuestionBlock, 
        null, 
        this
      );
    }
  }
  
  playerHitEnemy(player, enemy) {
    if (enemy.isDying) return;
    
    const isStomping = player.body.velocity.y > 100 && 
                       player.y + player.height / 2 < enemy.y;
    
    if (isStomping) {
      enemy.die();
      player.setVelocityY(Constants.PHYSICS.BOUNCE_VELOCITY);
      this.scoreManager.addScore(enemy.getScore());
    } else {
      player.hurt();
    }
  }
  
  collectItem(player, item) {
    item.collect(player);
  }
  
  hitQuestionBlock(player, block) {
    if (player.body.velocity.y < 0 && !block.isEmpty) {
      block.isEmpty = true;
      block.setTexture('empty_block');
      
      this.spawnItemFromBlock(block);
      
      this.scene.tweens.add({
        targets: block,
        y: block.y - 10,
        duration: 100,
        yoyo: true
      });
    }
  }
  
  spawnItemFromBlock(block) {
    const ItemClasses = this.scene.itemClasses;
    if (!ItemClasses) return;
    
    let item;
    const itemType = block.itemType;
    
    if (itemType === 'coin' && ItemClasses.Coin) {
      item = new ItemClasses.Coin(this.scene, block.x, block.y - 32);
      item.body.setAllowGravity(false);
      this.scene.time.delayedCall(500, () => {
        if (item && item.scene) {
          this.collectItem(this.player, item);
        }
      });
    } else if (itemType === 'mushroom' && ItemClasses.Mushroom) {
      item = new ItemClasses.Mushroom(this.scene, block.x, block.y - 32);
    } else if (itemType === 'fireflower' && ItemClasses.FireFlower) {
      item = new ItemClasses.FireFlower(this.scene, block.x, block.y - 32);
    }
    
    if (item) {
      this.itemGroup.add(item);
      
      if (this.scene.groundGroup) {
        this.scene.physics.add.collider(item, this.scene.groundGroup);
      }
      if (this.scene.platformGroup) {
        this.scene.physics.add.collider(item, this.scene.platformGroup);
      }
    }
  }
  
  addFireballCollisions(fireballGroup) {
    this.scene.physics.add.overlap(
      fireballGroup,
      this.enemyGroup,
      this.fireballHitEnemy,
      null,
      this
    );
  }
  
  fireballHitEnemy(fireball, enemy) {
    if (enemy.isDying) return;
    
    fireball.destroy();
    enemy.die();
    this.scoreManager.addScore(enemy.getScore());
  }
}

export default CollisionManager;
