// 输入管理器
export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.isPressed = false;
    this.pressStartTime = 0;
    this.onChargeStart = null;
    this.onChargeEnd = null;
    
    this.init();
  }
  
  init() {
    // 鼠标事件
    this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
    this.canvas.addEventListener('mouseup', (e) => this.handlePointerUp(e));
    this.canvas.addEventListener('mouseleave', (e) => this.handlePointerUp(e));
    
    // 触摸事件
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handlePointerDown(e);
    });
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.handlePointerUp(e);
    });
    this.canvas.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      this.handlePointerUp(e);
    });
  }
  
  handlePointerDown(e) {
    if (this.isPressed) return;
    
    this.isPressed = true;
    this.pressStartTime = performance.now();
    
    if (this.onChargeStart) {
      this.onChargeStart();
    }
  }
  
  handlePointerUp(e) {
    if (!this.isPressed) return;
    
    this.isPressed = false;
    const duration = (performance.now() - this.pressStartTime) / 1000; // 转换为秒
    
    if (this.onChargeEnd) {
      this.onChargeEnd(duration);
    }
  }
  
  getChargeDuration() {
    if (!this.isPressed) return 0;
    return (performance.now() - this.pressStartTime) / 1000;
  }
}
