// 渲染系统
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }
    
    // 清空画布
    clear() {
        this.ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // 渲染地图
    renderMap(map) {
        map.render(this.ctx);
    }
    
    // 渲染坦克
    renderTank(tank) {
        this.ctx.save();
        
        // 绘制坦克主体
        this.ctx.fillStyle = tank.color;
        this.ctx.fillRect(tank.x, tank.y, tank.width, tank.height);
        
        // 绘制炮管
        const center = getRectCenter(tank);
        const barrelLength = tank.width * 0.6;
        
        this.ctx.strokeStyle = tank.color;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(center.x, center.y);
        
        switch (tank.direction) {
            case CONFIG.DIRECTION.UP:
                this.ctx.lineTo(center.x, tank.y);
                break;
            case CONFIG.DIRECTION.RIGHT:
                this.ctx.lineTo(tank.x + tank.width, center.y);
                break;
            case CONFIG.DIRECTION.DOWN:
                this.ctx.lineTo(center.x, tank.y + tank.height);
                break;
            case CONFIG.DIRECTION.LEFT:
                this.ctx.lineTo(tank.x, center.y);
                break;
        }
        
        this.ctx.stroke();
        
        // 绘制边框
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(tank.x, tank.y, tank.width, tank.height);
        
        this.ctx.restore();
    }
    
    // 渲染子弹
    renderBullet(bullet) {
        this.ctx.fillStyle = CONFIG.COLORS.BULLET;
        this.ctx.beginPath();
        this.ctx.arc(
            bullet.x + bullet.width / 2,
            bullet.y + bullet.height / 2,
            bullet.width / 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }
    
    // 渲染基地
    renderBase(base) {
        this.ctx.fillStyle = CONFIG.COLORS.BASE;
        this.ctx.fillRect(base.x, base.y, base.width, base.height);
        
        // 绘制旗帜标志
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(base.x + base.width / 2 - 2, base.y + 5, 4, base.height - 10);
        this.ctx.beginPath();
        this.ctx.moveTo(base.x + base.width / 2, base.y + 5);
        this.ctx.lineTo(base.x + base.width / 2 + 8, base.y + 10);
        this.ctx.lineTo(base.x + base.width / 2, base.y + 15);
        this.ctx.fill();
    }
    
    // 渲染UI文本
    renderText(text, x, y, fontSize = 20, color = '#fff', align = 'center') {
        this.ctx.fillStyle = color;
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, x, y);
    }
    
    // 渲染游戏结束屏幕
    renderGameOver(message) {
        // 半透明覆盖层
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 主消息
        this.renderText(
            message,
            this.canvas.width / 2,
            this.canvas.height / 2 - 30,
            48,
            message.includes('胜利') ? '#00ff00' : '#ff0000'
        );
        
        // 提示信息
        this.renderText(
            '点击"重新开始"按钮继续游戏',
            this.canvas.width / 2,
            this.canvas.height / 2 + 30,
            20,
            '#fff'
        );
    }
    
    // 渲染暂停屏幕
    renderPaused() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderText(
            '游戏暂停',
            this.canvas.width / 2,
            this.canvas.height / 2,
            48,
            '#ffff00'
        );
        
        this.renderText(
            '按 ESC 继续',
            this.canvas.width / 2,
            this.canvas.height / 2 + 40,
            20,
            '#fff'
        );
    }
}
