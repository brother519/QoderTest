import { CANVAS_WIDTH } from '../constants.js';

export class GameHUD {
    constructor(game) {
        this.game = game;
    }
    
    render(ctx) {
        this.renderPlayerInfo(ctx);
        this.renderEnemyInfo(ctx);
        this.renderPowerUpIndicators(ctx);
    }
    
    renderPlayerInfo(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(5, 5, 130, 75);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        
        ctx.fillText(`关卡: ${this.game.currentLevel}`, 15, 22);
        
        ctx.fillText(`分数: ${this.game.score}`, 15, 40);
        
        ctx.fillStyle = '#e74c3c';
        let hearts = '';
        for (let i = 0; i < this.game.lives; i++) {
            hearts += '♥ ';
        }
        ctx.fillText(hearts, 15, 58);
        
        if (this.game.player) {
            this.renderPlayerBuffs(ctx);
        }
    }
    
    renderPlayerBuffs(ctx) {
        const player = this.game.player;
        const buffs = [];
        const now = performance.now();
        
        if (player.isShielded) {
            const remaining = Math.ceil((player.shieldEndTime - now) / 1000);
            buffs.push({ icon: '🛡', time: remaining, color: '#3498db' });
        }
        
        if (player.speedMultiplier > 1) {
            const remaining = Math.ceil((player.speedEndTime - now) / 1000);
            buffs.push({ icon: '⚡', time: remaining, color: '#2ecc71' });
        }
        
        if (player.isPowered) {
            const remaining = Math.ceil((player.powerEndTime - now) / 1000);
            buffs.push({ icon: '★', time: remaining, color: '#e74c3c' });
        }
        
        buffs.forEach((buff, index) => {
            const x = 15 + index * 35;
            const y = 70;
            
            ctx.fillStyle = buff.color;
            ctx.font = '14px Arial';
            ctx.fillText(buff.icon, x, y);
            
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.fillText(`${buff.time}s`, x + 18, y);
        });
    }
    
    renderEnemyInfo(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(CANVAS_WIDTH - 90, 5, 85, 30);
        
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`敌人: ${this.game.enemiesRemaining}`, CANVAS_WIDTH - 15, 25);
    }
    
    renderPowerUpIndicators(ctx) {
    }
}
