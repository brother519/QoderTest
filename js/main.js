// 游戏主入口
let game = null;

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    
    // 创建游戏实例
    game = new Game(canvas);
    
    // 开始游戏按钮
    startBtn.addEventListener('click', () => {
        startBtn.style.display = 'none';
        game.start();
    });
    
    // 重新开始按钮
    restartBtn.addEventListener('click', () => {
        restartBtn.style.display = 'none';
        startBtn.style.display = 'inline-block';
        game.restart();
    });
    
    // 初始渲染
    game.render();
});
