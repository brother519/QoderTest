import Phaser from 'phaser';
import Tank from './Tank';
import { TANK_SPEED } from '@/utils/constants';

export default class EnemyTank extends Tank {
  private aiController?: any;

  constructor(scene: Phaser.Scene, x: number, y: number, color: number) {
    super(scene, x, y, color, TANK_SPEED);
  }

  setAIController(controller: any) {
    this.aiController = controller;
  }

  updateAI() {
    if (this.aiController) {
      this.aiController.update();
    }
  }
}
