// 游戏循环引擎
export class GameLoop {
  constructor(updateCallback, renderCallback) {
    this.updateCallback = updateCallback;
    this.renderCallback = renderCallback;
    this.lastTime = 0;
    this.accumulator = 0;
    this.fixedTimeStep = 1000 / 60; // 60 FPS
    this.running = false;
    this.animationId = null;
  }
  
  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }
  
  stop() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  loop(currentTime) {
    if (!this.running) return;
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // 防止deltaTime过大（如切换标签页后）
    const clampedDelta = Math.min(deltaTime, 100);
    this.accumulator += clampedDelta;
    
    // 固定时间步长更新物理
    while (this.accumulator >= this.fixedTimeStep) {
      this.updateCallback(this.fixedTimeStep / 1000); // 转换为秒
      this.accumulator -= this.fixedTimeStep;
    }
    
    // 渲染
    this.renderCallback();
    
    this.animationId = requestAnimationFrame((time) => this.loop(time));
  }
}
