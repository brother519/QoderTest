import { Constants } from '../utils/Constants.js';

// 渲染器
export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = Constants.CANVAS_WIDTH;
        this.canvas.height = Constants.CANVAS_HEIGHT;
    }
    
    clear() {
        this.ctx.fillStyle = Constants.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    render(game) {
        this.clear();
        
        // 渲染地图（不含草地）
        if (game.map) {
            game.map.render(this.ctx);
        }
        
        // 渲染基地
        if (game.base) {
            game.base.render(this.ctx);
        }
        
        // 渲染敌方坦克
        for (const enemy of game.enemyTanks) {
            if (enemy.isAlive) {
                enemy.render(this.ctx);
            }
        }
        
        // 渲染玩家坦克
        if (game.playerTank && game.playerTank.isAlive) {
            game.playerTank.render(this.ctx);
        }
        
        // 渲染草地（遮挡效果）
        if (game.map) {
            game.map.renderGrass(this.ctx);
        }
        
        // 渲染子弹
        for (const bullet of game.bullets) {
            if (bullet.isActive) {
                bullet.render(this.ctx);
            }
        }
        
        // 渲染爆炸效果
        this.renderExplosions(game.explosions);
    }
    
    renderExplosions(explosions) {
        const now = Date.now();
        const explosionDuration = 300;
        
        for (const explosion of explosions) {
            const elapsed = now - explosion.time;
            if (elapsed > explosionDuration) continue;
            
            const progress = elapsed / explosionDuration;
            const radius = 15 + progress * 10;
            const alpha = 1 - progress;
            
            // 外圈
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 69, 0, ${alpha * 0.5})`;
            this.ctx.fill();
            
            // 内圈
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, radius * 0.6, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            this.ctx.fill();
            
            // 中心
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, radius * 0.3, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.fill();
        }
    }
}
