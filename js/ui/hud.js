import { CONFIG } from '../config.js';

export class HUD {
    constructor() {
    }

    render(renderer, player, level, remainingEnemies) {
        if (!player) return;
        
        renderer.drawText(`生命: ${player.health}`, 10, 25, '#FFFFFF', '18px Arial');
        
        renderer.drawText(`得分: ${player.score}`, CONFIG.CANVAS_WIDTH - 120, 25, '#FFFFFF', '18px Arial');
        
        renderer.drawText(`关卡: ${level}`, CONFIG.CANVAS_WIDTH - 120, 50, '#FFFFFF', '18px Arial');
        
        renderer.drawText(`敌人: ${remainingEnemies}`, CONFIG.CANVAS_WIDTH - 120, 75, '#FFFFFF', '18px Arial');
    }
}
