import { CONFIG } from '../config.js';

/**
 * 渲染引擎
 * 负责所有图形绘制
 */
export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
    }
    
    /**
     * 清空画布
     */
    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * 绘制矩形
     */
    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }
    
    /**
     * 绘制边框矩形
     */
    drawStrokeRect(x, y, width, height, color, lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(x, y, width, height);
    }
    
    /**
     * 绘制圆形
     */
    drawCircle(x, y, radius, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * 绘制文本
     */
    drawText(text, x, y, options = {}) {
        const {
            color = '#fff',
            font = '16px Arial',
            align = 'left',
            baseline = 'top'
        } = options;
        
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;
        this.ctx.fillText(text, x, y);
    }
    
    /**
     * 绘制坦克（简化版，使用几何图形）
     */
    drawTank(x, y, direction, color, size = CONFIG.TANK.SIZE) {
        this.ctx.save();
        this.ctx.translate(x + size / 2, y + size / 2);
        this.ctx.rotate(direction * Math.PI / 2);
        
        // 坦克主体
        this.ctx.fillStyle = color;
        this.ctx.fillRect(-size / 2, -size / 2, size, size);
        
        // 坦克边框
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(-size / 2, -size / 2, size, size);
        
        // 炮管
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(-size / 6, -size / 2 - size / 3, size / 3, size / 2);
        
        // 炮塔
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    /**
     * 绘制子弹
     */
    drawBullet(x, y, direction, size = CONFIG.BULLET.SIZE) {
        this.ctx.fillStyle = '#ff0';
        this.ctx.fillRect(x, y, size, size);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, size, size);
    }
    
    /**
     * 绘制砖墙
     */
    drawBrick(x, y, size = CONFIG.TILE_SIZE) {
        // 砖墙背景
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x, y, size, size);
        
        // 砖块纹理
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 1;
        
        // 横向砖缝
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + size / 2);
        this.ctx.lineTo(x + size, y + size / 2);
        this.ctx.stroke();
        
        // 纵向砖缝
        this.ctx.beginPath();
        this.ctx.moveTo(x + size / 2, y);
        this.ctx.lineTo(x + size / 2, y + size / 2);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + size / 2, y + size / 2);
        this.ctx.lineTo(x + size / 2, y + size);
        this.ctx.stroke();
    }
    
    /**
     * 绘制钢墙
     */
    drawSteel(x, y, size = CONFIG.TILE_SIZE) {
        this.ctx.fillStyle = '#808080';
        this.ctx.fillRect(x, y, size, size);
        
        // 金属光泽效果
        this.ctx.fillStyle = '#a0a0a0';
        this.ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        
        this.ctx.strokeStyle = '#606060';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, size, size);
    }
    
    /**
     * 绘制河流
     */
    drawWater(x, y, size = CONFIG.TILE_SIZE, frame = 0) {
        // 水面背景
        const waterColors = ['#1e90ff', '#4169e1'];
        this.ctx.fillStyle = waterColors[Math.floor(frame / 15) % 2];
        this.ctx.fillRect(x, y, size, size);
        
        // 波纹效果
        this.ctx.strokeStyle = '#87ceeb';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
    }
    
    /**
     * 绘制草地
     */
    drawGrass(x, y, size = CONFIG.TILE_SIZE) {
        this.ctx.fillStyle = '#228b22';
        this.ctx.fillRect(x, y, size, size);
        
        // 草丛纹理
        this.ctx.fillStyle = '#32cd32';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if ((i + j) % 2 === 0) {
                    this.ctx.fillRect(x + i * size / 3, y + j * size / 3, size / 3, size / 3);
                }
            }
        }
    }
    
    /**
     * 绘制冰面
     */
    drawIce(x, y, size = CONFIG.TILE_SIZE) {
        this.ctx.fillStyle = '#e0ffff';
        this.ctx.fillRect(x, y, size, size);
        
        this.ctx.strokeStyle = '#add8e6';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, size, size);
        
        // 冰晶效果
        this.ctx.strokeStyle = '#b0e0e6';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + size, y + size);
        this.ctx.moveTo(x + size, y);
        this.ctx.lineTo(x, y + size);
        this.ctx.stroke();
    }
    
    /**
     * 绘制基地
     */
    drawBase(x, y, size = CONFIG.TILE_SIZE, isDestroyed = false) {
        if (isDestroyed) {
            // 被摧毁的基地
            this.ctx.fillStyle = '#800000';
            this.ctx.fillRect(x, y, size * 2, size * 2);
            
            // 绘制X
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + size * 2, y + size * 2);
            this.ctx.moveTo(x + size * 2, y);
            this.ctx.lineTo(x, y + size * 2);
            this.ctx.stroke();
        } else {
            // 正常基地
            this.ctx.fillStyle = '#ffd700';
            this.ctx.fillRect(x, y, size * 2, size * 2);
            
            // 基地标志
            this.ctx.fillStyle = '#ff0000';
            this.ctx.beginPath();
            this.ctx.moveTo(x + size, y + size / 2);
            this.ctx.lineTo(x + size - size / 3, y + size);
            this.ctx.lineTo(x + size + size / 3, y + size);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, size * 2, size * 2);
        }
    }
    
    /**
     * 绘制爆炸效果
     */
    drawExplosion(x, y, size, frame) {
        const colors = ['#ff0000', '#ff6600', '#ffff00', '#ff9900'];
        const colorIndex = Math.floor(frame / 3) % colors.length;
        
        this.ctx.fillStyle = colors[colorIndex];
        this.ctx.beginPath();
        this.ctx.arc(x + size / 2, y + size / 2, size / 2 + frame * 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 外圈
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    /**
     * 绘制无敌护盾
     */
    drawShield(x, y, size, frame) {
        const alpha = (Math.sin(frame * 0.2) + 1) / 2 * 0.5 + 0.3;
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x - 2, y - 2, size + 4, size + 4);
        this.ctx.restore();
    }
}
