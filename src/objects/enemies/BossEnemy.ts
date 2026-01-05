import Phaser from 'phaser';
import Enemy from './Enemy';
import { ENEMY_BOSS_SPEED, SCORE_BOSS_ENEMY } from '../../utils/Constants';

export default class BossEnemy extends Enemy {
  private direction: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy_boss'); // 暂时使用占位纹理
    
    // 设置BOSS敌机的属性
    this.health = 20; // 高血量
    this.speed = ENEMY_BOSS_SPEED;
    this.score = SCORE_BOSS_ENEMY;
    this.movementPattern = 'horizontal';
    
    // BOSS使用紫色
    this.setTint(0x9933cc);
    
    this.direction = 1; // 移动方向，1为右，-1为左
  }

  move() {
    // BOSS水平移动，碰到边界时反弹
    this.setVelocityX(this.speed * this.direction);
    
    // 检查是否碰到边界，如果碰到则改变方向
    if (this.x <= 50 || this.x >= this.scene.game.config.width as number - 50) {
      this.direction *= -1;
    }
    
    // 同时缓慢向下移动
    this.setVelocityY(ENEMY_BOSS_SPEED / 2);
  }
}
