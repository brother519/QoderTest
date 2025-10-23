import { GameEngine } from './GameEngine.js';

/**
 * 游戏入口
 */
function main() {
    // 获取canvas元素
    const canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    // 创建游戏引擎
    const engine = new GameEngine(canvas);
    
    // 启动游戏
    engine.start();
    
    // 暴露到全局（用于调试）
    window.game = engine;
}

// 页面加载完成后启动游戏
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}
