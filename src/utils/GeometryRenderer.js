class GeometryRenderer {
  static createPlayerTexture(scene, state) {
    const graphics = scene.add.graphics();
    
    if (state === 'SMALL') {
      graphics.fillStyle(0xff0000, 1);
      graphics.fillRect(0, 0, 16, 32);
      graphics.generateTexture('player_small', 16, 32);
    } else if (state === 'BIG') {
      graphics.fillStyle(0xff0000, 1);
      graphics.fillRect(0, 0, 16, 48);
      graphics.fillStyle(0xcc0000, 1);
      graphics.fillRect(0, 0, 16, 16);
      graphics.generateTexture('player_big', 16, 48);
    } else if (state === 'FIRE') {
      graphics.fillStyle(0xff6600, 1);
      graphics.fillRect(0, 0, 16, 48);
      graphics.fillStyle(0xff9933, 1);
      graphics.fillRect(0, 0, 16, 16);
      graphics.generateTexture('player_fire', 16, 48);
    }
    
    graphics.destroy();
  }
  
  static createEnemyTexture(scene, type) {
    const graphics = scene.add.graphics();
    
    if (type === 'GOOMBA') {
      graphics.fillStyle(0x8b4513, 1);
      graphics.fillRoundedRect(0, 0, 16, 16, 4);
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(5, 6, 2);
      graphics.fillCircle(11, 6, 2);
      graphics.generateTexture('goomba', 16, 16);
    } else if (type === 'KOOPA') {
      graphics.fillStyle(0x00ff00, 1);
      graphics.fillEllipse(8, 12, 16, 12);
      graphics.fillStyle(0x00cc00, 1);
      graphics.fillRect(6, 0, 4, 8);
      graphics.generateTexture('koopa', 16, 24);
    } else if (type === 'KOOPA_SHELL') {
      graphics.fillStyle(0x00ff00, 1);
      graphics.fillRoundedRect(0, 0, 16, 16, 4);
      graphics.fillStyle(0x00cc00, 1);
      graphics.fillRect(4, 6, 8, 4);
      graphics.generateTexture('koopa_shell', 16, 16);
    }
    
    graphics.destroy();
  }
  
  static createItemTexture(scene, type) {
    const graphics = scene.add.graphics();
    
    if (type === 'COIN') {
      graphics.fillStyle(0xffff00, 1);
      graphics.fillCircle(6, 6, 6);
      graphics.fillStyle(0xffcc00, 1);
      graphics.fillCircle(6, 6, 4);
      graphics.generateTexture('coin', 12, 12);
    } else if (type === 'MUSHROOM') {
      graphics.fillStyle(0xff0000, 1);
      graphics.fillEllipse(8, 8, 16, 10);
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(5, 6, 2);
      graphics.fillCircle(11, 6, 2);
      graphics.fillStyle(0xff6666, 1);
      graphics.fillRect(6, 8, 4, 8);
      graphics.generateTexture('mushroom', 16, 16);
    } else if (type === 'FIREFLOWER') {
      graphics.fillStyle(0xff6600, 1);
      graphics.fillCircle(8, 8, 3);
      graphics.fillStyle(0xffff00, 1);
      graphics.fillCircle(8, 3, 2);
      graphics.fillCircle(13, 8, 2);
      graphics.fillCircle(8, 13, 2);
      graphics.fillCircle(3, 8, 2);
      graphics.fillStyle(0x00ff00, 1);
      graphics.fillRect(7, 10, 2, 6);
      graphics.generateTexture('fireflower', 16, 16);
    } else if (type === 'FIREBALL') {
      graphics.fillStyle(0xff6600, 1);
      graphics.fillCircle(4, 4, 4);
      graphics.fillStyle(0xffff00, 1);
      graphics.fillCircle(4, 4, 2);
      graphics.generateTexture('fireball', 8, 8);
    }
    
    graphics.destroy();
  }
  
  static createPlatformTexture(scene, type) {
    const graphics = scene.add.graphics();
    
    if (type === 'GROUND') {
      graphics.fillStyle(0x8b4513, 1);
      graphics.fillRect(0, 0, 32, 32);
      graphics.lineStyle(1, 0x654321, 1);
      graphics.strokeRect(0, 0, 32, 32);
      graphics.generateTexture('platform', 32, 32);
    } else if (type === 'BRICK') {
      graphics.fillStyle(0xff6600, 1);
      graphics.fillRect(0, 0, 32, 32);
      graphics.lineStyle(1, 0xcc5500, 1);
      for (let i = 0; i < 4; i++) {
        graphics.lineBetween(0, i * 8, 32, i * 8);
        graphics.lineBetween(i * 8, 0, i * 8, 32);
      }
      graphics.generateTexture('brick', 32, 32);
    } else if (type === 'QUESTION') {
      graphics.fillStyle(0xffff00, 1);
      graphics.fillRect(0, 0, 32, 32);
      graphics.fillStyle(0x000000, 1);
      graphics.fillStyle(0xffcc00, 1);
      scene.add.text(0, 0, '?', {
        fontSize: '28px',
        color: '#000'
      }).setOrigin(0, 0);
      setTimeout(() => {
        graphics.generateTexture('question_block', 32, 32);
        graphics.destroy();
      }, 10);
      return;
    } else if (type === 'EMPTY') {
      graphics.fillStyle(0x999999, 1);
      graphics.fillRect(0, 0, 32, 32);
      graphics.lineStyle(1, 0x666666, 1);
      graphics.strokeRect(0, 0, 32, 32);
      graphics.generateTexture('empty_block', 32, 32);
    }
    
    graphics.destroy();
  }
  
  static createAllTextures(scene) {
    this.createPlayerTexture(scene, 'SMALL');
    this.createPlayerTexture(scene, 'BIG');
    this.createPlayerTexture(scene, 'FIRE');
    
    this.createEnemyTexture(scene, 'GOOMBA');
    this.createEnemyTexture(scene, 'KOOPA');
    this.createEnemyTexture(scene, 'KOOPA_SHELL');
    
    this.createItemTexture(scene, 'COIN');
    this.createItemTexture(scene, 'MUSHROOM');
    this.createItemTexture(scene, 'FIREFLOWER');
    this.createItemTexture(scene, 'FIREBALL');
    
    this.createPlatformTexture(scene, 'GROUND');
    this.createPlatformTexture(scene, 'BRICK');
    this.createPlatformTexture(scene, 'QUESTION');
    this.createPlatformTexture(scene, 'EMPTY');
  }
}

export default GeometryRenderer;
