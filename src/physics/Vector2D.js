// 二维向量工具类
export class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  clone() {
    return new Vector2D(this.x, this.y);
  }
  
  add(v) {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }
  
  subtract(v) {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }
  
  multiply(scalar) {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }
  
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  
  normalize() {
    const len = this.length();
    if (len === 0) return new Vector2D();
    return new Vector2D(this.x / len, this.y / len);
  }
  
  static lerp(a, b, t) {
    return new Vector2D(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t
    );
  }
}
