import { Vector2D } from '../physics/Vector2D.js';
import { Config } from '../utils/Config.js';

// 摄像机控制
export class Camera {
  constructor(screenWidth, screenHeight) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.offset = new Vector2D(0, 0);
    this.targetOffset = new Vector2D(0, 0);
  }
  
  update(targetPosition) {
    // 计算目标偏移量
    this.targetOffset.x = targetPosition.x - this.screenWidth * Config.CAMERA_OFFSET_X_RATIO;
    this.targetOffset.y = targetPosition.y - this.screenHeight * 0.6;
    
    // 确保不会向左滚动
    this.targetOffset.x = Math.max(0, this.targetOffset.x);
    
    // 平滑插值
    this.offset = Vector2D.lerp(this.offset, this.targetOffset, Config.CAMERA_SMOOTH_FACTOR);
  }
  
  getOffset() {
    return this.offset;
  }
  
  resize(screenWidth, screenHeight) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
  }
}
