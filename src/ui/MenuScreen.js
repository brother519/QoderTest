// 菜单界面
class MenuScreen {
    constructor() {
        this.blinkTimer = 0;
        this.showText = true;
    }
    
    /**
     * 更新闪烁效果
     */
    update(deltaTime) {
        this.blinkTimer += deltaTime;
        if (this.blinkTimer > 500) {
            this.showText = !this.showText;
            this.blinkTimer = 0;
        }
    }
    
    /**
     * 渲染菜单界面
     */
    renderMenu(renderer) {
        const centerX = Constants.CANVAS_WIDTH / 2;
        const centerY = Constants.CANVAS_HEIGHT / 2;
        
        // 标题
        renderer.drawText('超级坦克大战', centerX, centerY - 60, '#FFD700', 24, 'center');
        
        // 闪烁的开始提示
        if (this.showText) {
            renderer.drawText('按 Enter 开始游戏', centerX, centerY, '#FFF', 16, 'center');
        }
        
        // 操作说明
        renderer.drawText('方向键：移动', centerX, centerY + 40, '#AAA', 14, 'center');
        renderer.drawText('空格：射击', centerX, centerY + 60, '#AAA', 14, 'center');
        renderer.drawText('Enter：暂停', centerX, centerY + 80, '#AAA', 14, 'center');
    }
    
    /**
     * 渲染暂停界面
     */
    renderPause(renderer) {
        const centerX = Constants.CANVAS_WIDTH / 2;
        const centerY = Constants.CANVAS_HEIGHT / 2;
        
        // 半透明背景
        renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        renderer.ctx.fillRect(0, 0, Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
        
        // 暂停文本
        renderer.drawText('游戏暂停', centerX, centerY - 20, '#FFD700', 24, 'center');
        
        if (this.showText) {
            renderer.drawText('按 Enter 继续', centerX, centerY + 20, '#FFF', 16, 'center');
        }
    }
    
    /**
     * 渲染游戏结束界面
     */
    renderGameOver(renderer, score, highScore) {
        const centerX = Constants.CANVAS_WIDTH / 2;
        const centerY = Constants.CANVAS_HEIGHT / 2;
        
        // 半透明背景
        renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        renderer.ctx.fillRect(0, 0, Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
        
        // 游戏结束
        renderer.drawText('游戏结束', centerX, centerY - 60, '#FF0000', 28, 'center');
        
        // 分数
        renderer.drawText(`分数: ${score}`, centerX, centerY - 10, '#FFF', 18, 'center');
        renderer.drawText(`最高分: ${highScore}`, centerX, centerY + 20, '#FFD700', 18, 'center');
        
        // 重新开始提示
        if (this.showText) {
            renderer.drawText('按 Enter 重新开始', centerX, centerY + 60, '#FFF', 16, 'center');
        }
    }
    
    /**
     * 渲染胜利界面
     */
    renderVictory(renderer, score, level) {
        const centerX = Constants.CANVAS_WIDTH / 2;
        const centerY = Constants.CANVAS_HEIGHT / 2;
        
        // 半透明背景
        renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        renderer.ctx.fillRect(0, 0, Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
        
        // 胜利
        renderer.drawText('关卡完成！', centerX, centerY - 60, '#00FF00', 28, 'center');
        
        // 分数
        renderer.drawText(`关卡: ${level}`, centerX, centerY - 10, '#FFF', 18, 'center');
        renderer.drawText(`分数: ${score}`, centerX, centerY + 20, '#FFD700', 18, 'center');
        
        // 继续提示
        if (this.showText) {
            renderer.drawText('按 Enter 继续', centerX, centerY + 60, '#FFF', 16, 'center');
        }
    }
}
