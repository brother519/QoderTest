// HUD - 游戏内UI显示
class HUD {
    constructor() {
        this.iconSize = 8;
    }
    
    /**
     * 渲染HUD
     */
    render(renderer, player, spawnManager, scoreManager, level) {
        const rightPanelX = Constants.CANVAS_WIDTH + 20;
        
        // 如果画布不够宽，显示在底部
        if (rightPanelX > Constants.CANVAS_WIDTH) {
            this.renderCompact(renderer, player, spawnManager, scoreManager, level);
            return;
        }
        
        // 显示当前关卡
        renderer.drawText(`关卡: ${level}`, 10, 20, '#FFF', 14);
        
        // 显示分数
        renderer.drawText(`分数: ${scoreManager.getScore()}`, 10, 40, '#FFF', 14);
        
        // 显示最高分
        renderer.drawText(`最高分: ${scoreManager.getHighScore()}`, 10, 60, '#FFF', 14);
        
        // 显示玩家生命数
        renderer.drawText(`生命: ${player.lives}`, 10, 80, '#FFF', 14);
        
        // 显示剩余敌人数量
        const remaining = spawnManager.getRemainingEnemies();
        renderer.drawText(`敌人: ${remaining}`, 10, 100, '#FFF', 14);
        
        // 绘制剩余敌人图标
        this.renderEnemyIcons(renderer, remaining, 10, 120);
    }
    
    /**
     * 紧凑模式渲染（在游戏区域内）
     */
    renderCompact(renderer, player, spawnManager, scoreManager, level) {
        const padding = 5;
        const y = Constants.CANVAS_HEIGHT - 20;
        
        // 顶部信息
        renderer.drawText(`Lv:${level}`, padding, 15, '#FFF', 12);
        renderer.drawText(`分数:${scoreManager.getScore()}`, padding + 60, 15, '#FFF', 12);
        renderer.drawText(`生命:${player.lives}`, padding + 180, 15, '#FFF', 12);
        renderer.drawText(`敌人:${spawnManager.getRemainingEnemies()}`, padding + 270, 15, '#FFF', 12);
    }
    
    /**
     * 渲染敌人图标
     */
    renderEnemyIcons(renderer, count, startX, startY) {
        const iconsPerRow = 2;
        const iconSize = 8;
        const spacing = 4;
        
        for (let i = 0; i < Math.min(count, 20); i++) {
            const col = i % iconsPerRow;
            const row = Math.floor(i / iconsPerRow);
            const x = startX + col * (iconSize + spacing);
            const y = startY + row * (iconSize + spacing);
            
            renderer.drawRect(x, y, iconSize, iconSize, Constants.COLORS.ENEMY_TANK);
        }
    }
}
