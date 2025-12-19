import { CONFIG } from '../utils/Config.js';
import { ResourceLoader } from './ResourceLoader.js';

export class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    this.canvas.width = CONFIG.CANVAS_WIDTH;
    this.canvas.height = CONFIG.CANVAS_HEIGHT;
    
    this.state = CONFIG.GAME_STATES.LOADING;
    this.resourceLoader = new ResourceLoader();
    
    this.lastFrameTime = 0;
    this.fps = 0;
    this.frameCount = 0;
    this.fpsUpdateTime = 0;
    
    this.currentScene = null;
    
    this.animationId = null;
  }

  async init() {
    console.log('Initializing game...');
    
    const resources = [];
    
    const success = await this.resourceLoader.loadResources(resources);
    
    if (success) {
      console.log('Resources loaded successfully');
      this.state = CONFIG.GAME_STATES.MENU;
    } else {
      console.error('Failed to load resources');
    }
    
    return success;
  }

  start() {
    console.log('Starting game loop...');
    this.lastFrameTime = performance.now();
    this.gameLoop(this.lastFrameTime);
  }

  gameLoop(currentTime) {
    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    
    this.updateFPS(currentTime, deltaTime);
    
    this.update(deltaTime);
    this.render();
  }

  update(deltaTime) {
    if (this.currentScene && this.currentScene.update) {
      this.currentScene.update(deltaTime);
    }
  }

  render() {
    this.ctx.fillStyle = '#000033';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (this.state === CONFIG.GAME_STATES.LOADING) {
      this.renderLoading();
    } else if (this.currentScene && this.currentScene.render) {
      this.currentScene.render(this.ctx);
    }
  }

  renderLoading() {
    const progress = this.resourceLoader.getProgress();
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Loading...', this.canvas.width / 2, this.canvas.height / 2 - 20);
    
    const barWidth = 400;
    const barHeight = 30;
    const x = (this.canvas.width - barWidth) / 2;
    const y = this.canvas.height / 2;
    
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.strokeRect(x, y, barWidth, barHeight);
    
    this.ctx.fillStyle = '#00ff00';
    this.ctx.fillRect(x, y, barWidth * progress, barHeight);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`${Math.floor(progress * 100)}%`, this.canvas.width / 2, y + barHeight + 30);
  }

  updateFPS(currentTime, deltaTime) {
    this.frameCount++;
    
    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
      
      const fpsCounter = document.getElementById('fps-counter');
      if (fpsCounter) {
        fpsCounter.textContent = `FPS: ${this.fps}`;
      }
    }
  }

  setScene(scene) {
    if (this.currentScene && this.currentScene.exit) {
      this.currentScene.exit();
    }
    
    this.currentScene = scene;
    
    if (this.currentScene && this.currentScene.enter) {
      this.currentScene.enter();
    }
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}
