import { Game } from './core/Game.js';

window.addEventListener('DOMContentLoaded', async () => {
  console.log('飞机大战游戏启动中...');
  
  const game = new Game('game-canvas');
  
  await game.init();
  
  game.start();
  
  console.log('游戏循环已启动, FPS计数器显示在右上角');
});
