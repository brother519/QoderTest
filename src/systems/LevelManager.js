class LevelManager {
  constructor(scene) {
    this.scene = scene;
    this.levelData = scene.cache.json.get('level1');
    this.currentLevelIndex = 0;
  }
  
  getCurrentLevel() {
    return this.levelData[this.currentLevelIndex];
  }
  
  nextLevel() {
    if (this.currentLevelIndex < this.levelData.length - 1) {
      this.currentLevelIndex++;
      return true;
    }
    return false;
  }
  
  resetLevel() {
    this.currentLevelIndex = 0;
  }
}

export default LevelManager;
