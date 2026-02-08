import { Vector2D } from '../physics/Vector2D.js';
import { Config } from '../utils/Config.js';

// 平台类
export class Platform {
  constructor(x, y, width, color = null) {
    this.position = new Vector2D(x, y);
    this.width = width;
    this.height = Config.PLATFORM_HEIGHT;
    this.color = color || this.getRandomColor();
  }
  
  get x() {
    return this.position.x;
  }
  
  get y() {
    return this.position.y;
  }
  
  getRandomColor() {
    const colors = Config.PLATFORM_COLORS;
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // 获取平台中心X坐标
  getCenterX() {
    return this.position.x + this.width / 2;
  }
  
  // 获取平台顶部Y坐标
  getTopY() {
    return this.position.y;
  }
  
  // 检查点是否在平台表面上
  isPointOnSurface(x, y, threshold = 10) {
    return x >= this.position.x &&
           x <= this.position.x + this.width &&
           Math.abs(y - this.position.y) < threshold;
  }
  
  // 获取AABB边界
  getBounds() {
    return {
      left: this.position.x,
      right: this.position.x + this.width,
      top: this.position.y,
      bottom: this.position.y + this.height
    };
  }
  
  // 检查是否是Perfect落点（中心区域）
  isPerfectZone(x) {
    const centerX = this.getCenterX();
    const perfectRadius = this.width * Config.PERFECT_ZONE_RATIO / 2;
    return Math.abs(x - centerX) < perfectRadius;
  }
}
