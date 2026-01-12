import { GameLoop } from './GameLoop.js';
import { Renderer } from './renderer/Renderer.js';
import { Camera } from './renderer/Camera.js';
import { Player, PlayerState } from './entities/Player.js';
import { InputManager } from './input/InputManager.js';
import { PhysicsEngine } from './physics/PhysicsEngine.js';
import { PlatformGenerator } from './game/PlatformGenerator.js';
import { ScoreManager } from './game/ScoreManager.js';

// 游戏状态枚举
export const GameState = {
  READY: 'READY',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER'
};

// 游戏主控制器
export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.state = GameState.READY;
    
    // 初始化子系统
    this.renderer = new Renderer(canvas);
    this.camera = new Camera(this.renderer.width, this.renderer.height);
    this.inputManager = new InputManager(canvas);
    this.physicsEngine = new PhysicsEngine();
    this.platformGenerator = new PlatformGenerator();
    this.scoreManager = new ScoreManager();
    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render()
    );
    
    // 游戏对象
    this.player = null;
    this.platforms = [];
    this.perfectEffects = []; // Perfect特效队列
    
    // 绑定输入事件
    this.setupInput();
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      this.camera.resize(this.renderer.width, this.renderer.height);
    });
    
    // 初始化游戏
    this.init();
  }
  
  init() {
    // 设置地面Y坐标（屏幕中下方）
    const groundY = this.renderer.height * 0.6;
    
    // 生成初始平台
    this.platforms = this.platformGenerator.generateInitialPlatforms(groundY);
    
    // 创建玩家，放在第一个平台上
    const firstPlatform = this.platforms[0];
    this.player = new Player(
      firstPlatform.getCenterX(),
      firstPlatform.getTopY() - 20 // 玩家半径
    );
    this.player.currentPlatform = firstPlatform;
    this.player.isGrounded = true;
    
    // 重置分数
    this.scoreManager.reset();
    
    // 重置摄像机
    this.camera.offset.x = 0;
    this.camera.offset.y = 0;
  }
  
  setupInput() {
    this.inputManager.onChargeStart = () => {
      if (this.state === GameState.READY) {
        this.state = GameState.PLAYING;
        this.player.startCharging();
      } else if (this.state === GameState.PLAYING && this.player.state === PlayerState.IDLE) {
        this.player.startCharging();
      } else if (this.state === GameState.GAME_OVER) {
        // 重新开始
        this.restart();
      }
    };
    
    this.inputManager.onChargeEnd = (duration) => {
      if (this.state === GameState.PLAYING && this.player.state === PlayerState.CHARGING) {
        this.player.jump();
      }
    };
  }
  
  update(deltaTime) {
    if (this.state !== GameState.PLAYING) return;
    
    // 更新玩家
    this.player.update(deltaTime);
    
    // 检测碰撞
    if (this.player.state === PlayerState.FALLING) {
      const landedPlatform = this.physicsEngine.checkPlatformCollision(
        this.player, 
        this.platforms
      );
      
      if (landedPlatform) {
        this.handleLanding(landedPlatform);
      }
    }
    
    // 检测游戏结束（掉出屏幕）
    if (this.player.isOutOfBounds(this.renderer.height, this.camera.offset.y)) {
      this.gameOver();
    }
    
    // 更新摄像机
    this.camera.update(this.player.position);
    
    // 确保有足够的平台
    this.platformGenerator.ensurePlatforms(
      this.player.position.x, 
      this.renderer.width
    );
    
    // 清理旧平台
    const currentIndex = this.platformGenerator.getPlatformIndex(this.player.currentPlatform);
    this.platformGenerator.cleanup(this.camera.offset.x, currentIndex);
    this.platforms = this.platformGenerator.platforms;
    
    // 更新Perfect特效
    this.updateEffects(deltaTime);
  }
  
  handleLanding(platform) {
    // 检查是否是Perfect落点
    const isPerfect = platform.isPerfectZone(this.player.position.x);
    
    // 玩家落地
    this.player.landOnPlatform(platform);
    
    // 计分
    const result = this.scoreManager.landingScore(isPerfect);
    
    // 添加Perfect特效
    if (isPerfect) {
      this.perfectEffects.push({
        x: this.player.position.x,
        y: this.player.position.y,
        alpha: 1,
        life: 1
      });
    }
    
    // 检查是否需要增加难度
    if (this.scoreManager.shouldIncreaseDifficulty()) {
      this.platformGenerator.increaseDifficulty();
    }
  }
  
  updateEffects(deltaTime) {
    for (let i = this.perfectEffects.length - 1; i >= 0; i--) {
      const effect = this.perfectEffects[i];
      effect.life -= deltaTime * 2;
      effect.alpha = effect.life;
      effect.y -= deltaTime * 50;
      
      if (effect.life <= 0) {
        this.perfectEffects.splice(i, 1);
      }
    }
  }
  
  render() {
    // 清空画布
    this.renderer.clear();
    
    if (this.state === GameState.READY) {
      // 绘制游戏场景预览
      this.renderGameScene();
      // 绘制开始界面
      this.renderer.drawStartScreen();
    } else if (this.state === GameState.PLAYING) {
      // 绘制游戏场景
      this.renderGameScene();
      // 绘制UI
      this.renderer.drawUI(
        this.scoreManager.score,
        this.scoreManager.highScore,
        this.scoreManager.combo
      );
    } else if (this.state === GameState.GAME_OVER) {
      // 绘制游戏场景
      this.renderGameScene();
      // 绘制游戏结束界面
      this.renderer.drawGameOverScreen(
        this.scoreManager.score,
        this.scoreManager.highScore,
        this.scoreManager.isNewRecord()
      );
    }
  }
  
  renderGameScene() {
    const ctx = this.renderer.ctx;
    const offset = this.camera.getOffset();
    
    // 保存画布状态
    this.renderer.save();
    
    // 应用摄像机偏移
    this.renderer.translate(-offset.x, -offset.y);
    
    // 绘制平台
    for (const platform of this.platforms) {
      const isActive = platform === this.player.currentPlatform;
      this.renderer.drawPlatform(platform, isActive);
    }
    
    // 绘制玩家
    this.renderer.drawPlayer(this.player);
    
    // 绘制蓄力指示器
    this.renderer.drawChargeIndicator(this.player);
    
    // 绘制Perfect特效
    for (const effect of this.perfectEffects) {
      ctx.save();
      ctx.globalAlpha = effect.alpha;
      this.renderer.drawPerfectEffect(effect.x, effect.y);
      ctx.restore();
    }
    
    // 恢复画布状态
    this.renderer.restore();
  }
  
  gameOver() {
    this.state = GameState.GAME_OVER;
  }
  
  restart() {
    this.state = GameState.READY;
    this.perfectEffects = [];
    this.init();
  }
  
  start() {
    this.gameLoop.start();
  }
  
  stop() {
    this.gameLoop.stop();
  }
}