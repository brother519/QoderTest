import Phaser from 'phaser';

export default class ParticleManager {
  private scene: Phaser.Scene;
  private particles: Map<string, Phaser.GameObjects.Particles.ParticleEmitterManager>;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.particles = new Map();
  }

  // 创建爆炸粒子效果
  createExplosion(x: number, y: number) {
    // 由于当前环境限制，我们创建一个简单的视觉效果替代
    // 在实际游戏中，这里会使用Phaser的粒子系统
    
    // 创建一个短暂的圆形表示爆炸
    const explosion = this.scene.add.circle(x, y, 20, 0xff9900)
      .setAlpha(0.8);
    
    // 添加动画效果
    this.scene.tweens.add({
      targets: explosion,
      radius: 40,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        explosion.destroy();
      }
    });
  }

  // 创建玩家引擎粒子效果
  createEngineEffect(player: Phaser.GameObjects.GameObject) {
    // 这里可以创建跟随玩家的粒子效果
    // 暂时留空，实际实现需要在有图形环境时进行
  }

  // 创建道具收集粒子效果
  createPowerUpEffect(x: number, y: number, type: string) {
    // 创建道具收集的视觉效果
    const color = type === 'health' ? 0x00ff00 : 0xffff00; // 绿色或黄色
    const effect = this.scene.add.circle(x, y, 10, color)
      .setAlpha(0.7);
    
    this.scene.tweens.add({
      targets: effect,
      scale: 2,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        effect.destroy();
      }
    });
  }

  // 清理所有粒子
  clear() {
    // 在实际实现中，会停止并清理所有粒子系统
  }
}