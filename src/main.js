import { Game } from './Game.js';

// 游戏入口
function main() {
  const canvas = document.getElementById('gameCanvas');
  
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }
  
  // 创建并启动游戏
  const game = new Game(canvas);
  game.start();
  
  // 调试：暴露到全局（可选）
  window.game = game;
}

// 等待DOM加载完成
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
