export class GameObject {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    this.vx = 0;
    this.vy = 0;
    
    this.health = 1;
    this.maxHealth = 1;
    
    this.active = true;
    this.visible = true;
    
    this.color = '#ffffff';
  }

  update(deltaTime) {
    this.x += this.vx;
    this.y += this.vy;
  }

  render(ctx) {
    if (!this.visible) return;
    
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  checkCollision(other) {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      this.destroy();
    }
  }

  destroy() {
    this.active = false;
  }

  isOffScreen(canvasWidth, canvasHeight) {
    return (
      this.x + this.width < 0 ||
      this.x > canvasWidth ||
      this.y + this.height < 0 ||
      this.y > canvasHeight
    );
  }

  getCenterX() {
    return this.x + this.width / 2;
  }

  getCenterY() {
    return this.y + this.height / 2;
  }
}
