import { Constants } from '../utils/Constants.js';

// 基地类
export class Base {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Constants.TANK_SIZE;
        this.isDestroyed = false;
    }
    
    takeDamage() {
        this.isDestroyed = true;
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.size,
            height: this.size
        };
    }
    
    render(ctx) {
        const colors = Constants.COLORS;
        
        if (this.isDestroyed) {
            // 被摧毁的基地
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x, this.y, this.size, this.size);
            
            // 残骸效果
            ctx.fillStyle = '#555';
            ctx.fillRect(this.x + 4, this.y + 4, 8, 8);
            ctx.fillRect(this.x + 20, this.y + 20, 8, 8);
        } else {
            // 正常基地 - 绘制老鹰图案
            ctx.fillStyle = colors.BASE;
            ctx.fillRect(this.x, this.y, this.size, this.size);
            
            // 基地边框
            ctx.strokeStyle = colors.BASE_DARK;
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x + 2, this.y + 2, this.size - 4, this.size - 4);
            
            // 简化的鹰形图案
            ctx.fillStyle = colors.BASE_DARK;
            
            // 鹰身体
            ctx.beginPath();
            ctx.moveTo(this.x + this.size / 2, this.y + 6);
            ctx.lineTo(this.x + this.size - 6, this.y + this.size / 2);
            ctx.lineTo(this.x + this.size / 2, this.y + this.size - 6);
            ctx.lineTo(this.x + 6, this.y + this.size / 2);
            ctx.closePath();
            ctx.fill();
            
            // 中心
            ctx.fillStyle = colors.BASE;
            ctx.beginPath();
            ctx.arc(this.x + this.size / 2, this.y + this.size / 2, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
