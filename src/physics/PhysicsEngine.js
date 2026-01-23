import { Config } from '../utils/Config.js';

// 物理引擎
export class PhysicsEngine {
  constructor() {
    this.gravity = Config.GRAVITY;
  }
  
  // 检测玩家是否落在平台上
  checkPlatformCollision(player, platforms) {
    // 只在下落时检测
    if (player.velocity.y <= 0) return null;
    
    const playerBottom = player.getBottomY();
    const playerX = player.position.x;
    
    for (const platform of platforms) {
      const bounds = platform.getBounds();
      
      // 检查水平位置是否在平台范围内
      if (playerX >= bounds.left && playerX <= bounds.right) {
        // 检查垂直位置是否刚好落在平台上
        const previousBottom = playerBottom - player.velocity.y * (1 / 60);
        
        if (previousBottom <= bounds.top && playerBottom >= bounds.top) {
          return platform;
        }
        
        // 宽松一点的检测（防止穿过）
        if (playerBottom >= bounds.top && playerBottom <= bounds.top + 30) {
          return platform;
        }
      }
    }
    
    return null;
  }
  
  // 计算跳跃预测轨迹（可用于显示预测落点）
  calculateJumpTrajectory(startX, startY, chargeTime, steps = 50) {
    const effectiveChargeTime = Math.max(chargeTime, Config.MIN_CHARGE_TIME);
    const normalizedCharge = (effectiveChargeTime - Config.MIN_CHARGE_TIME) / 
                             (Config.MAX_CHARGE_TIME - Config.MIN_CHARGE_TIME);
    const jumpForce = Config.MIN_JUMP_FORCE + 
                     (Config.MAX_JUMP_FORCE - Config.MIN_JUMP_FORCE) * Math.pow(normalizedCharge, 1.5);
    
    const vx = jumpForce * Math.cos(Config.JUMP_ANGLE);
    const vy = -jumpForce * Math.sin(Config.JUMP_ANGLE);
    
    const trajectory = [];
    const dt = 0.02; // 时间步长
    
    let x = startX;
    let y = startY;
    let currentVy = vy;
    
    for (let i = 0; i < steps; i++) {
      trajectory.push({ x, y });
      currentVy += this.gravity * dt;
      x += vx * dt;
      y += currentVy * dt;
      
      // 如果已经低于起点很多，停止计算
      if (y > startY + 200) break;
    }
    
    return trajectory;
  }
}
