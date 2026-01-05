import Phaser from 'phaser';
import Enemy from './Enemy';
import { ENEMY_FAST_SPEED, SCORE_FAST_ENEMY } from '../../utils/Constants';

export default class FastEnemy extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy_basic'); // 暂时使用基础敌机纹理
    
    // 设置快速敌机的属性
    this.health = 1;
    this.speed = ENEMY_FAST_SPEED;
    this.score = SCORE_FAST_ENEMY;
    this.movementPattern = 'straight';
    
    // 快速敌机使用橙色
    this.setTint(0xff6600);
  }
}
