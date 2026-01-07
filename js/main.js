// main.js - 游戏初始化入口
document.addEventListener('DOMContentLoaded', () => {
    // 初始化游戏
    const game = new Game('gameCanvas');
    
    // 启动游戏
    game.start();
    
    // 处理窗口大小变化
    window.addEventListener('resize', () => {
        // 延迟执行以避免频繁调用
        setTimeout(() => {
            game.handleResize();
        }, 100);
    });
    
    // 防止上下文菜单（长按时）
    document.getElementById('gameCanvas').addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // 暴露游戏实例到全局作用域，方便调试
    window.sheepGame = game;
    
    console.log('羊了个羊游戏已启动！');
});