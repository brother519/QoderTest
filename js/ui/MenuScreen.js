import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

export class MenuScreen {
    constructor(game) {
        this.game = game;
        this.selectedIndex = 0;
        this.items = [
            { label: '开始游戏', action: 'start' },
            { label: '继续游戏', action: 'continue' },
            { label: '关卡编辑', action: 'editor' },
            { label: '排行榜', action: 'leaderboard' }
        ];
        this.isActive = true;
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        const input = this.game.input;
        
        if (input.isKeyPressed('UP')) {
            this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
            this.game.audio.play('hit');
        }
        
        if (input.isKeyPressed('DOWN')) {
            this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
            this.game.audio.play('hit');
        }
        
        if (input.isConfirmPressed()) {
            this.selectItem();
        }
    }
    
    selectItem() {
        const item = this.items[this.selectedIndex];
        
        switch (item.action) {
            case 'start':
                this.game.startGame(false);
                break;
            case 'continue':
                if (this.game.storage.hasSaveData()) {
                    this.game.startGame(true);
                } else {
                    this.game.startGame(false);
                }
                break;
            case 'editor':
                break;
            case 'leaderboard':
                break;
        }
    }
    
    render(ctx) {
        if (!this.isActive) return;
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('坦克大战', CANVAS_WIDTH / 2, 120);
        
        ctx.fillStyle = '#888';
        ctx.font = '16px Arial';
        ctx.fillText('TANK BATTLE', CANVAS_WIDTH / 2, 150);
        
        this.renderTankIcon(ctx, CANVAS_WIDTH / 2 - 80, 200);
        this.renderTankIcon(ctx, CANVAS_WIDTH / 2 + 50, 200);
        
        const startY = 300;
        const lineHeight = 45;
        
        this.items.forEach((item, index) => {
            const y = startY + index * lineHeight;
            
            if (index === this.selectedIndex) {
                ctx.fillStyle = '#f1c40f';
                ctx.font = 'bold 20px Arial';
                ctx.fillText('► ' + item.label + ' ◄', CANVAS_WIDTH / 2, y);
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = '18px Arial';
                
                if (item.action === 'continue' && !this.game.storage.hasSaveData()) {
                    ctx.fillStyle = '#555';
                }
                
                ctx.fillText(item.label, CANVAS_WIDTH / 2, y);
            }
        });
        
        ctx.fillStyle = '#555';
        ctx.font = '12px Arial';
        ctx.fillText('↑↓ 选择  |  Enter/空格 确认', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 60);
        ctx.fillText('WASD/方向键 移动  |  空格/J/鼠标左键 射击', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40);
    }
    
    renderTankIcon(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(-12, -12, 24, 24);
        
        ctx.fillStyle = '#333';
        ctx.fillRect(-3, -16, 6, 8);
        
        ctx.fillStyle = '#555';
        ctx.fillRect(-12, -12, 6, 24);
        ctx.fillRect(6, -12, 6, 24);
        
        ctx.restore();
    }
    
    show() {
        this.isActive = true;
        this.selectedIndex = 0;
    }
    
    hide() {
        this.isActive = false;
    }
}
