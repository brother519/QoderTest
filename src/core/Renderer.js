// 渲染引擎 - 负责所有Canvas绘制
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 禁用图像平滑，实现像素风格
        this.ctx.imageSmoothingEnabled = false;
    }
    
    /**
     * 清空画布
     */
    clear() {
        this.ctx.fillStyle = Constants.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
    }
    
    /**
     * 绘制矩形
     */
    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.floor(x), Math.floor(y), width, height);
    }
    
    /**
     * 绘制带边框的矩形
     */
    drawRectWithBorder(x, y, width, height, fillColor, borderColor, borderWidth = 1) {
        this.ctx.fillStyle = fillColor;
        this.ctx.fillRect(Math.floor(x), Math.floor(y), width, height);
        
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = borderWidth;
        this.ctx.strokeRect(Math.floor(x), Math.floor(y), width, height);
    }
    
    /**
     * 绘制坦克
     */
    drawTank(tank) {
        const x = Math.floor(tank.x);
        const y = Math.floor(tank.y);
        const size = tank.size;
        
        // 主体颜色
        let color = tank.color;
        
        // 绘制坦克主体
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, size, size);
        
        // 绘制炮管方向指示
        const barrelLength = 8;
        const barrelWidth = 4;
        let barrelX = x + size / 2 - barrelWidth / 2;
        let barrelY = y + size / 2 - barrelWidth / 2;
        
        this.ctx.fillStyle = color;
        
        switch (tank.direction) {
            case Constants.DIRECTION.UP:
                this.ctx.fillRect(barrelX, y - barrelLength, barrelWidth, barrelLength);
                break;
            case Constants.DIRECTION.DOWN:
                this.ctx.fillRect(barrelX, y + size, barrelWidth, barrelLength);
                break;
            case Constants.DIRECTION.LEFT:
                this.ctx.fillRect(x - barrelLength, barrelY, barrelLength, barrelWidth);
                break;
            case Constants.DIRECTION.RIGHT:
                this.ctx.fillRect(x + size, barrelY, barrelLength, barrelWidth);
                break;
        }
        
        // 绘制边框
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, size, size);
    }
    
    /**
     * 绘制子弹
     */
    drawBullet(bullet) {
        const x = Math.floor(bullet.x);
        const y = Math.floor(bullet.y);
        
        this.ctx.fillStyle = Constants.COLORS.BULLET;
        this.ctx.fillRect(x, y, bullet.size, bullet.size);
    }
    
    /**
     * 绘制地图块
     */
    drawTile(tile, x, y) {
        const pixelX = Math.floor(x);
        const pixelY = Math.floor(y);
        
        switch (tile.type) {
            case Constants.TILE_TYPE.BRICK:
                this.drawBrickWall(pixelX, pixelY, tile.size);
                break;
            case Constants.TILE_TYPE.STEEL:
                this.drawSteelWall(pixelX, pixelY, tile.size);
                break;
            case Constants.TILE_TYPE.WATER:
                this.drawWater(pixelX, pixelY, tile.size);
                break;
            case Constants.TILE_TYPE.FOREST:
                this.drawForest(pixelX, pixelY, tile.size);
                break;
        }
    }
    
    /**
     * 绘制砖墙
     */
    drawBrickWall(x, y, size) {
        this.ctx.fillStyle = Constants.COLORS.BRICK;
        this.ctx.fillRect(x, y, size, size);
        
        // 绘制砖块纹理
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 1;
        
        const brickSize = size / 2;
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                this.ctx.strokeRect(x + i * brickSize, y + j * brickSize, brickSize, brickSize);
            }
        }
    }
    
    /**
     * 绘制钢墙
     */
    drawSteelWall(x, y, size) {
        this.ctx.fillStyle = Constants.COLORS.STEEL;
        this.ctx.fillRect(x, y, size, size);
        
        // 绘制钢铁纹理
        this.ctx.strokeStyle = '#888';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
    }
    
    /**
     * 绘制水域
     */
    drawWater(x, y, size) {
        this.ctx.fillStyle = Constants.COLORS.WATER;
        this.ctx.fillRect(x, y, size, size);
        
        // 绘制波浪效果
        this.ctx.strokeStyle = '#1E90FF';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + size / 2);
        this.ctx.lineTo(x + size, y + size / 2);
        this.ctx.stroke();
    }
    
    /**
     * 绘制草地
     */
    drawForest(x, y, size) {
        this.ctx.fillStyle = Constants.COLORS.FOREST;
        this.ctx.fillRect(x, y, size, size);
        
        // 绘制草地纹理（简单的点）
        this.ctx.fillStyle = '#2F4F2F';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.ctx.fillRect(x + i * 5 + 2, y + j * 5 + 2, 2, 2);
            }
        }
    }
    
    /**
     * 绘制基地
     */
    drawBase(base) {
        const x = Math.floor(base.x);
        const y = Math.floor(base.y);
        const size = base.size;
        
        if (base.destroyed) {
            // 绘制被摧毁的基地
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(x, y, size, size);
            
            // 绘制X
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + size, y + size);
            this.ctx.moveTo(x + size, y);
            this.ctx.lineTo(x, y + size);
            this.ctx.stroke();
        } else {
            // 绘制正常基地（老鹰图案简化版）
            this.ctx.fillStyle = Constants.COLORS.BASE;
            this.ctx.fillRect(x, y, size, size);
            
            // 绘制简单的老鹰标志
            this.ctx.fillStyle = '#FF0000';
            const centerX = x + size / 2;
            const centerY = y + size / 2;
            this.ctx.fillRect(centerX - 8, centerY - 8, 16, 16);
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, size, size);
        }
    }
    
    /**
     * 绘制爆炸效果
     */
    drawExplosion(x, y, size) {
        this.ctx.fillStyle = '#FF6600';
        this.ctx.fillRect(Math.floor(x - size / 2), Math.floor(y - size / 2), size, size);
        
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.fillRect(Math.floor(x - size / 4), Math.floor(y - size / 4), size / 2, size / 2);
    }
    
    /**
     * 绘制文本
     */
    drawText(text, x, y, color = '#FFF', size = 16, align = 'left') {
        this.ctx.fillStyle = color;
        this.ctx.font = `${size}px "Courier New", monospace`;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, Math.floor(x), Math.floor(y));
    }
}
