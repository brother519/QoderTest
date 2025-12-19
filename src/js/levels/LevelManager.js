export class LevelManager {
  constructor() {
    this.currentLevel = 1;
    this.currentWave = 0;
    this.levelConfig = null;
    this.waveTimer = 0;
    this.levelStartTime = 0;
    this.enemiesKilled = 0;
    this.totalEnemiesInLevel = 0;
    this.levelCompleted = false;
  }

  loadLevel(levelConfig) {
    this.levelConfig = levelConfig;
    this.currentWave = 0;
    this.waveTimer = 0;
    this.levelStartTime = 0;
    this.enemiesKilled = 0;
    this.levelCompleted = false;
    
    this.totalEnemiesInLevel = levelConfig.waves.reduce((sum, wave) => {
      return sum + (wave.count || 0);
    }, 0);
    
    console.log(`Level ${this.currentLevel} loaded: ${this.totalEnemiesInLevel} enemies total`);
  }

  update(deltaTime, gameTime) {
    if (!this.levelConfig || this.levelCompleted) return null;
    
    if (this.levelStartTime === 0) {
      this.levelStartTime = gameTime;
    }
    
    const timeSinceLevelStart = gameTime - this.levelStartTime;
    
    const enemiesToSpawn = [];
    
    for (let i = this.currentWave; i < this.levelConfig.waves.length; i++) {
      const wave = this.levelConfig.waves[i];
      
      if (timeSinceLevelStart >= wave.time) {
        console.log(`Spawning wave ${i + 1}/${this.levelConfig.waves.length}`);
        
        for (let j = 0; j < wave.count; j++) {
          enemiesToSpawn.push({
            type: wave.type,
            delay: j * (wave.spawnDelay || 200)
          });
        }
        
        this.currentWave = i + 1;
      } else {
        break;
      }
    }
    
    if (this.currentWave >= this.levelConfig.waves.length && 
        this.enemiesKilled >= this.totalEnemiesInLevel) {
      this.levelCompleted = true;
      console.log(`Level ${this.currentLevel} completed!`);
    }
    
    return enemiesToSpawn;
  }

  onEnemyKilled() {
    this.enemiesKilled++;
  }

  isLevelComplete() {
    return this.levelCompleted;
  }

  getProgress() {
    if (this.totalEnemiesInLevel === 0) return 0;
    return this.enemiesKilled / this.totalEnemiesInLevel;
  }

  getCurrentLevel() {
    return this.currentLevel;
  }

  nextLevel() {
    this.currentLevel++;
    this.levelCompleted = false;
  }

  reset() {
    this.currentLevel = 1;
    this.currentWave = 0;
    this.waveTimer = 0;
    this.levelStartTime = 0;
    this.enemiesKilled = 0;
    this.totalEnemiesInLevel = 0;
    this.levelCompleted = false;
  }
}
