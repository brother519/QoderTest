// 2D向量工具类
class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    // 向量加法
    add(vector) {
        return new Vector2D(this.x + vector.x, this.y + vector.y);
    }
    
    // 向量减法
    subtract(vector) {
        return new Vector2D(this.x - vector.x, this.y - vector.y);
    }
    
    // 标量乘法
    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }
    
    // 向量长度
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    // 归一化
    normalize() {
        const len = this.length();
        if (len === 0) return new Vector2D(0, 0);
        return new Vector2D(this.x / len, this.y / len);
    }
    
    // 复制
    clone() {
        return new Vector2D(this.x, this.y);
    }
    
    // 设置值
    set(x, y) {
        this.x = x;
        this.y = y;
    }
}
