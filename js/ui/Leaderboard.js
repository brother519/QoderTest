import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

export class Leaderboard {
    constructor(game) {
        this.game = game;
        this.isActive = false;
        this.scores = [];
    }
    
    show() {
        this.isActive = true;
        this.scores = this.game.storage.getHighScores();
    }
    
    hide() {
        this.isActive = false;
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        if (this.game.input.isKeyPressed('PAUSE') || this.game.input.isConfirmPressed()) {
            this.hide();
            this.game.ui.showMenu();
        }
    }
    
    render(ctx) {
        if (!this.isActive) return;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('排行榜', CANVAS_WIDTH / 2, 60);
        
        if (this.scores.length === 0) {
            ctx.fillStyle = '#888';
            ctx.font = '16px Arial';
            ctx.fillText('暂无记录', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        } else {
            const startY = 120;
            const lineHeight = 40;
            
            ctx.font = '14px Arial';
            ctx.fillStyle = '#888';
            ctx.textAlign = 'left';
            ctx.fillText('排名', 100, startY - 20);
            ctx.fillText('名称', 180, startY - 20);
            ctx.textAlign = 'right';
            ctx.fillText('分数', CANVAS_WIDTH - 100, startY - 20);
            
            this.scores.forEach((score, index) => {
                const y = startY + index * lineHeight;
                
                if (index < 3) {
                    ctx.fillStyle = ['#f1c40f', '#95a5a6', '#cd7f32'][index];
                } else {
                    ctx.fillStyle = '#fff';
                }
                
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(`${index + 1}.`, 100, y);
                
                ctx.font = '16px Arial';
                ctx.fillText(score.name, 180, y);
                
                ctx.textAlign = 'right';
                ctx.fillText(score.score.toLocaleString(), CANVAS_WIDTH - 100, y);
            });
        }
        
        ctx.fillStyle = '#555';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('按 Enter/ESC 返回', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40);
    }
}
