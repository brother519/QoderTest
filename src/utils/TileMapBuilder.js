class TileMapBuilder {
  static buildGround(scene, groundData) {
    if (!groundData || groundData.length === 0) return null;
    
    const group = scene.physics.add.staticGroup();
    
    groundData.forEach(tile => {
      const sprite = group.create(
        tile.x + tile.width / 2, 
        tile.y + tile.height / 2, 
        'platform'
      );
      sprite.setDisplaySize(tile.width, tile.height);
      sprite.refreshBody();
    });
    
    return group;
  }
  
  static buildPlatforms(scene, platformData) {
    if (!platformData || platformData.length === 0) return null;
    
    const group = scene.physics.add.staticGroup();
    
    platformData.forEach(tile => {
      const sprite = group.create(
        tile.x + tile.width / 2, 
        tile.y + tile.height / 2, 
        'platform'
      );
      sprite.setDisplaySize(tile.width, tile.height);
      sprite.refreshBody();
    });
    
    return group;
  }
  
  static buildQuestionBlocks(scene, blockData) {
    if (!blockData || blockData.length === 0) return null;
    
    const group = scene.physics.add.staticGroup();
    
    blockData.forEach(block => {
      const sprite = group.create(block.x, block.y, 'question_block');
      sprite.setDisplaySize(32, 32);
      sprite.itemType = block.itemType;
      sprite.isEmpty = false;
      sprite.refreshBody();
    });
    
    return group;
  }
}

export default TileMapBuilder;
