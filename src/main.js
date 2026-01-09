// 游戏入口 - 初始化并启动游戏
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    // 创建游戏实例
    const game = new Game(canvas);
    
    // 启动游戏
    game.start();
    
    console.log('超级坦克大战游戏已启动！');
});
