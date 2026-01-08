/**
 * 主入口文件
 * 负责初始化游戏并绑定所有UI事件
 */

// 全局变量
let game;  // 游戏控制器实例
let ui;    // UI管理器实例

/**
 * 页面加载完成后初始化
 * 创建游戏和UI实例，绑定事件，显示主菜单
 */
window.addEventListener('DOMContentLoaded', () => {
    // 创建游戏实例
    game = new GameController();
    ui = new UIManager();
    
    // 初始化游戏
    game.init(ui);
    
    // 绑定UI事件
    bindUIEvents();
    
    // 显示主菜单
    ui.showMainMenu();
});

/**
 * 绑定所有UI事件
 * 为按钮和Canvas绑定点击事件处理函数
 */
function bindUIEvents() {
    // ==================== 主菜单按钮 ====================
    // 开始游戏按钮
    document.getElementById('btn-start').addEventListener('click', () => {
        game.startGame();  // 从第一关开始游戏
    });
    
    // 关卡选择按钮
    document.getElementById('btn-level-select').addEventListener('click', () => {
        ui.showLevelSelect(game.getMaxUnlockedLevel(), game.getTotalLevels());
    });
    
    // ==================== 关卡选择返回按钮 ====================
    // 返回主菜单按钮
    document.getElementById('btn-back-menu').addEventListener('click', () => {
        ui.showMainMenu();
    });
    
    // ==================== 游戏控制按钮 ====================
    // 暂停按钮
    document.getElementById('btn-pause').addEventListener('click', () => {
        game.pauseGame();
    });
    
    // 重新开始按钮
    document.getElementById('btn-restart').addEventListener('click', () => {
        game.restartLevel();
    });
    
    // 退出按钮
    document.getElementById('btn-quit').addEventListener('click', () => {
        if (confirm('确定要退出游戏吗?')) {
            game.returnToMenu();
        }
    });
    
    // ==================== 暂停弹窗按钮 ====================
    // 继续游戏按钮
    document.getElementById('btn-resume').addEventListener('click', () => {
        game.resumeGame();
    });
    
    // 暂停界面的重新开始按钮
    document.getElementById('btn-restart-pause').addEventListener('click', () => {
        ui.hidePauseModal();
        game.restartLevel();
    });
    
    // 暂停界面的返回菜单按钮
    document.getElementById('btn-menu-pause').addEventListener('click', () => {
        ui.hidePauseModal();
        game.returnToMenu();
    });
    
    // ==================== 胜利弹窗按钮 ====================
    // 下一关按钮
    document.getElementById('btn-next-level').addEventListener('click', () => {
        ui.hideAllModals();
        game.nextLevel();
    });
    
    // 胜利界面的返回菜单按钮
    document.getElementById('btn-menu-victory').addEventListener('click', () => {
        ui.hideAllModals();
        game.returnToMenu();
    });
    
    // ==================== 失败弹窗按钮 ====================
    // 失败界面的重新开始按钮
    document.getElementById('btn-restart-failure').addEventListener('click', () => {
        ui.hideAllModals();
        game.restartLevel();
    });
    
    // 失败界面的返回菜单按钮
    document.getElementById('btn-menu-failure').addEventListener('click', () => {
        ui.hideAllModals();
        game.returnToMenu();
    });
    
    // ==================== 通关弹窗按钮 ====================
    // 通关界面的返回菜单按钮
    document.getElementById('btn-menu-complete').addEventListener('click', () => {
        ui.hideAllModals();
        game.returnToMenu();
    });
    
    // ==================== Canvas点击事件 ====================
    // 绑定棋盘点击事件，处理方块选择
    ui.bindCanvasClick((row, col) => {
        game.handleTileClick(row, col);  // 调用游戏控制器处理点击
    });
}
