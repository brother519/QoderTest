import Phaser from 'phaser';
import Tank from './Tank';
import { TANK_SPEED } from '@/utils/constants';

export default class PlayerTank extends Tank {
  private playerNumber: number;

  constructor(scene: Phaser.Scene, x: number, y: number, color: number, playerNumber: number) {
    super(scene, x, y, color, TANK_SPEED);
    this.playerNumber = playerNumber;
  }

  getPlayerNumber(): number {
    return this.playerNumber;
  }
}
