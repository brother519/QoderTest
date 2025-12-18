import { CANVAS_WIDTH, CANVAS_HEIGHT, GAME_STATES } from '../constants.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        this.menuSelection = 0;
        this.menuItems = ['开始游戏', '继续游戏', '关卡编辑', '排行榜'];
        this.showingMenu = true;
        this.levelIndicator = null;
    }
    
    showMenu() {
        this.showingMenu = true;
        this.menuSelection = 0;
    }
    
    hideMenu() {
        this.showingMenu = false;
    }
    
    showLevelIndicator(level) {
        this.levelIndicator = {
            level,
            startTime: performance.now(),
            duration: 2000
        };
    }
    
    renderMenu(ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('坦克大战', CANVAS_WIDTH / 2, 150);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#888';
        ctx.fillText('Tank Battle', CANVAS_WIDTH / 2, 180);
        
        const startY = 280;
        const lineHeight = 50;
        
        this.menuItems.forEach((item, index) => {
            const y = startY + index * lineHeight;
            
            if (index === this.menuSelection) {
                ctx.fillStyle = '#f1c40f';
                ctx.fillText('► ' + item + ' ◄', CANVAS_WIDTH / 2, y);
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = '18px Arial';
                ctx.fillText(item, CANVAS_WIDTH / 2, y);
            }
            ctx.font = '18px Arial';
        });
        
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.fillText('方向键选择 | Enter确认 | 空格开始', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80);
        ctx.fillText('WASD/方向键移动 | 空格/J射击 | ESC暂停', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 60);
        ctx.fillText('鼠标左键射击 | 右键移动', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40);
        
        this.handleMenuInput();
    }
    
    handleMenuInput() {
        const input = this.game.input;
        
        if (input.isKeyPressed('UP')) {
            this.menuSelection = (this.menuSelection - 1 + this.menuItems.length) % this.menuItems.length;
        }
        if (input.isKeyPressed('DOWN')) {
            this.menuSelection = (this.menuSelection + 1) % this.menuItems.length;
        }
        
        if (input.isConfirmPressed()) {
            this.selectMenuItem();
        }
    }
    
    selectMenuItem() {
        switch (this.menuSelection) {
            case 0:
                this.game.startGame(false);
                break;
            case 1:
                if (this.game.storage.hasSaveData()) {
                    this.game.startGame(true);
                } else {
                    this.game.startGame(false);
                }
                break;
            case 2:
                break;
            case 3:
                break;
        }
    }
    
    renderHUD(ctx) {
        if (this.game.gameState === GAME_STATES.MENU) return;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(5, 5, 120, 70);
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        ctx.fillText(`关卡: ${this.game.currentLevel}`, 15, 22);
        ctx.fillText(`分数: ${this.game.score}`, 15, 40);
        ctx.fillText(`生命: ${'♥'.repeat(this.game.lives)}`, 15, 58);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(CANVAS_WIDTH - 85, 5, 80, 30);
        
        ctx.fillStyle = '#e74c3c';
        ctx.textAlign = 'right';
        ctx.fillText(`敌人: ${this.game.enemiesRemaining}`, CANVAS_WIDTH - 15, 25);
        
        if (this.levelIndicator) {
            const elapsed = performance.now() - this.levelIndicator.startTime;
            if (elapsed < this.levelIndicator.duration) {
                const alpha = elapsed < 500 ? elapsed / 500 : 
                             elapsed > this.levelIndicator.duration - 500 ? 
                             (this.levelIndicator.duration - elapsed) / 500 : 1;
                
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.font = 'bold 32px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`第 ${this.levelIndicator.level} 关`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            } else {
                this.levelIndicator = null;
            }
        }
    }
    
    renderPauseOverlay(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏暂停', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
        
        ctx.font = '16px Arial';
        ctx.fillText('按 ESC 继续游戏', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    }
    
    renderGameOver(ctx, isWin) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.textAlign = 'center';
        
        if (isWin) {
            ctx.fillStyle = '#f1c40f';
            ctx.font = 'bold 48px Arial';
            ctx.fillText('胜利!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
        } else {
            ctx.fillStyle = '#e74c3c';
            ctx.font = 'bold 48px Arial';
            ctx.fillText('游戏结束', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
        }
        
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText(`最终得分: ${this.game.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = '#888';
        ctx.fillText('按 Enter 返回主菜单', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
        
        if (this.game.input.isConfirmPressed()) {
            this.game.returnToMenu();
        }
    }
}
