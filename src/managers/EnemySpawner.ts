import Phaser from 'phaser';
import BasicEnemy from '../objects/enemies/BasicEnemy';
import FastEnemy from '../objects/enemies/FastEnemy';
import HealthPowerUp from '../objects/powerups/HealthPowerUp';
import WeaponPowerUp from '../objects/powerups/WeaponPowerUp';
import { ENEMY_SPAWN_INTERVAL, POWERUP_DROP_CHANCE } from '../utils/Constants';

export default class EnemySpawner {
  private scene: Phaser.Scene;
  private spawnTimer: Phaser.Time.TimerEvent | null;
  private enemyGroup: Phaser.Physics.Arcade.Group;
  private powerUpGroup: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.spawnTimer = null;
    
    // 创建敌机组
    this.enemyGroup = scene.physics.add.group({
      classType: BasicEnemy,
      maxSize: 50,
      runChildUpdate: true
    });
    
    // 创建道具组
    this.powerUpGroup = scene.physics.add.group({
      classType: HealthPowerUp,
      maxSize: 10,
      runChildUpdate: true
    });
  }

  startSpawning() {
    // 创建定时器，定期生成敌机
    this.spawnTimer = this.scene.time.addEvent({
      delay: ENEMY_SPAWN_INTERVAL,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
  }

  stopSpawning() {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = null;
    }
  }

  private spawnEnemy() {
    // 随机生成敌机位置（在屏幕顶部）
    const x = Phaser.Math.Between(50, this.scene.game.config.width as number - 50);
    const y = -50; // 从屏幕上方外生成
    
    // 随机选择敌机类型
    const enemyType = Phaser.Math.Between(1, 100);
    
    let enemy: BasicEnemy | FastEnemy;
    
    if (enemyType <= 80) {
      // 80% 概率生成基础敌机
      enemy = new BasicEnemy(this.scene, x, y);
      this.enemyGroup.add(enemy);
    } else {
      // 20% 概率生成快速敌机
      enemy = new FastEnemy(this.scene, x, y);
      this.enemyGroup.add(enemy);
    }
  }

  // 检查敌机死亡时是否掉落道具
  checkPowerUpDrop(enemyX: number, enemyY: number) {
    const dropChance = Phaser.Math.Between(1, 100);
    
    if (dropChance <= POWERUP_DROP_CHANCE * 100) { // 转换为百分比
      // 随机选择道具类型
      const powerUpType = Phaser.Math.Between(1, 100) <= 50 ? 'health' : 'weapon';
      
      let powerUp;
      if (powerUpType === 'health') {
        powerUp = new HealthPowerUp(this.scene, enemyX, enemyY);
      } else {
        powerUp = new WeaponPowerUp(this.scene, enemyX, enemyY);
      }
      
      this.powerUpGroup.add(powerUp);
      return powerUp;
    }
    
    return null;
  }

  getEnemies() {
    return this.enemyGroup;
  }

  getPowerUps() {
    return this.powerUpGroup;
  }

  update(time: number, delta: number) {
    // 更新道具
    this.powerUpGroup.children.entries.forEach((powerUp: any) => {
      if (powerUp && powerUp.update) {
        powerUp.update();
      }
    });
  }
}