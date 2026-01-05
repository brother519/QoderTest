import Phaser from 'phaser';
import Enemy from './Enemy';
import { ENEMY_BASIC_SPEED, SCORE_BASIC_ENEMY } from '../../utils/Constants';

export default class BasicEnemy extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy_basic');
    
    // 设置基础敌机的属性
    this.health = 1;
    this.speed = ENEMY_BASIC_SPEED;
    this.score = SCORE_BASIC_ENEMY;
    this.movementPattern = 'straight';
  }
}
