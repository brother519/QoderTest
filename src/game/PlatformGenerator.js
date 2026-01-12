import { Platform } from '../entities/Platform.js';
import { Config } from '../utils/Config.js';

// 平台生成器
export class PlatformGenerator {
  constructor() {
    this.platforms = [];
    this.difficulty = 0;
  }
  
  // 生成初始平台
  generateInitialPlatforms(groundY) {
    this.platforms = [];
    this.difficulty = 0;
    
    // 第一个平台（起始平台，较大）
    const firstPlatform = new Platform(
      100,
      groundY,
      120,
      '#4ECDC4'
    );
    this.platforms.push(firstPlatform);
    
    // 生成后续平台
    for (let i = 1; i < Config.INITIAL_PLATFORM_COUNT; i++) {
      this.generateNextPlatform();
    }
    
    return this.platforms;
  }
  
  // 生成下一个平台
  generateNextPlatform() {
    const lastPlatform = this.platforms[this.platforms.length - 1];
    
    // 根据难度调整参数
    const difficultyFactor = Math.min(this.difficulty, Config.MAX_DIFFICULTY) / Config.MAX_DIFFICULTY;
    
    // 距离范围（难度越高，距离越远）
    const minDist = Config.PLATFORM_MIN_DISTANCE + difficultyFactor * 30;
    const maxDist = Config.PLATFORM_MAX_DISTANCE + difficultyFactor * 50;
    const distance = minDist + Math.random() * (maxDist - minDist);
    
    // 平台宽度（难度越高，平台越窄）
    const widthRange = Config.PLATFORM_MAX_WIDTH - Config.PLATFORM_MIN_WIDTH;
    const width = Config.PLATFORM_MAX_WIDTH - difficultyFactor * widthRange * 0.5 - 
                  Math.random() * widthRange * 0.3;
    
    // 垂直位置变化
    const verticalOffset = (Math.random() - 0.5) * 2 * Config.PLATFORM_VERTICAL_VARIATION;
    
    const newX = lastPlatform.x + lastPlatform.width / 2 + distance;
    const newY = Math.max(200, Math.min(500, lastPlatform.y + verticalOffset));
    
    const newPlatform = new Platform(newX - width / 2, newY, width);
    this.platforms.push(newPlatform);
    
    return newPlatform;
  }
  
  // 确保有足够的平台
  ensurePlatforms(playerX, screenWidth) {
    const lastPlatform = this.platforms[this.platforms.length - 1];
    
    // 如果最后一个平台已经在视野内，生成新平台
    while (lastPlatform.x < playerX + screenWidth * 2) {
      this.generateNextPlatform();
    }
  }
  
  // 清理屏幕外的旧平台（保留玩家当前和之前的平台）
  cleanup(cameraX, currentPlatformIndex) {
    const cleanupThreshold = cameraX - 300;
    
    // 保留至少currentPlatformIndex个平台
    let removeCount = 0;
    for (let i = 0; i < this.platforms.length - 2; i++) {
      if (this.platforms[i].x + this.platforms[i].width < cleanupThreshold) {
        removeCount++;
      } else {
        break;
      }
    }
    
    if (removeCount > 0) {
      this.platforms.splice(0, removeCount);
    }
  }
  
  // 增加难度
  increaseDifficulty() {
    this.difficulty++;
  }
  
  // 获取平台索引
  getPlatformIndex(platform) {
    return this.platforms.indexOf(platform);
  }
  
  // 重置
  reset(groundY) {
    return this.generateInitialPlatforms(groundY);
  }
}
