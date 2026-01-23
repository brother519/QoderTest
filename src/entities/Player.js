import { Vector2D } from '../physics/Vector2D.js';
import { Config } from '../utils/Config.js';

// 玩家状态枚举
export const PlayerState = {
  IDLE: 'IDLE',
  CHARGING: 'CHARGING',
  JUMPING: 'JUMPING',
  FALLING: 'FALLING'
};

// 玩家类
export class Player {
  constructor(x, y) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(0, 0);
    this.radius = Config.PLAYER_RADIUS;
    this.state = PlayerState.IDLE;
    this.chargeTime = 0;
    this.currentPlatform = null;
    this.isGrounded = false;
  }
  
  // 开始蓄力
  startCharging() {
    if (this.state === PlayerState.IDLE) {
      this.state = PlayerState.CHARGING;
      this.chargeTime = 0;
    }
  }
  
  // 更新蓄力
  updateCharging(deltaTime) {
    if (this.state === PlayerState.CHARGING) {
      this.chargeTime += deltaTime;
      this.chargeTime = Math.min(this.chargeTime, Config.MAX_CHARGE_TIME);
    }
  }
  
  // 跳跃
  jump() {
    if (this.state !== PlayerState.CHARGING) return;
    
    // 确保最小蓄力时间
    const effectiveChargeTime = Math.max(this.chargeTime, Config.MIN_CHARGE_TIME);
    
    // 计算跳跃力度（非线性映射）
    const normalizedCharge = (effectiveChargeTime - Config.MIN_CHARGE_TIME) / 
                             (Config.MAX_CHARGE_TIME - Config.MIN_CHARGE_TIME);
    const jumpForce = Config.MIN_JUMP_FORCE + 
                     (Config.MAX_JUMP_FORCE - Config.MIN_JUMP_FORCE) * Math.pow(normalizedCharge, 1.5);
    
    // 分解为水平和垂直速度（向右上方跳跃）
    this.velocity.x = jumpForce * Math.cos(Config.JUMP_ANGLE);
    this.velocity.y = -jumpForce * Math.sin(Config.JUMP_ANGLE);
    
    this.state = PlayerState.JUMPING;
    this.isGrounded = false;
    this.currentPlatform = null;
  }
  
  // 更新物理状态
  update(deltaTime) {
    if (this.state === PlayerState.CHARGING) {
      this.updateCharging(deltaTime);
      return;
    }
    
    if (this.state === PlayerState.JUMPING || this.state === PlayerState.FALLING) {
      // 应用重力
      this.velocity.y += Config.GRAVITY * deltaTime;
      
      // 更新位置
      this.position.x += this.velocity.x * deltaTime;
      this.position.y += this.velocity.y * deltaTime;
      
      // 判断是否开始下落
      if (this.velocity.y > 0 && this.state === PlayerState.JUMPING) {
        this.state = PlayerState.FALLING;
      }
    }
  }
  
  // 落地到平台上
  landOnPlatform(platform) {
    this.position.y = platform.getTopY() - this.radius;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.state = PlayerState.IDLE;
    this.isGrounded = true;
    this.currentPlatform = platform;
    this.chargeTime = 0;
  }
  
  // 获取底部Y坐标
  getBottomY() {
    return this.position.y + this.radius;
  }
  
  // 检查是否超出屏幕底部
  isOutOfBounds(screenHeight, cameraOffsetY) {
    return this.position.y - cameraOffsetY > screenHeight + 100;
  }
}
