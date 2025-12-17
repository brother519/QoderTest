import Phaser from 'phaser';
import { GameState, PlayerState } from '@/types/game.types';
import { PLAYER_LIVES } from '@/utils/constants';

export default class GameStateManager {
  private state: GameState;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, gameMode: 'single' | 'double') {
    this.scene = scene;
    this.state = {
      currentLevel: 1,
      gameMode,
      player1: {
        lives: PLAYER_LIVES,
        score: 0,
        activePowerUps: [],
      },
      player2: {
        lives: PLAYER_LIVES,
        score: 0,
        activePowerUps: [],
      },
      enemiesRemaining: 0,
      baseDestroyed: false,
      isPaused: false,
    };
  }

  setEnemiesRemaining(count: number) {
    this.state.enemiesRemaining = count;
  }

  enemyDestroyed(points: number = 100) {
    this.state.enemiesRemaining--;
    this.state.player1.score += points;
  }

  player1Hit() {
    this.state.player1.lives--;
    return this.state.player1.lives;
  }

  player2Hit() {
    this.state.player2.lives--;
    return this.state.player2.lives;
  }

  baseDestroyed() {
    this.state.baseDestroyed = true;
  }

  isGameOver(): boolean {
    if (this.state.baseDestroyed) return true;
    
    if (this.state.gameMode === 'single') {
      return this.state.player1.lives <= 0;
    } else {
      return this.state.player1.lives <= 0 && this.state.player2.lives <= 0;
    }
  }

  isLevelComplete(): boolean {
    return this.state.enemiesRemaining <= 0 && !this.state.baseDestroyed;
  }

  getState(): GameState {
    return this.state;
  }

  getPlayer1State(): PlayerState {
    return this.state.player1;
  }

  getPlayer2State(): PlayerState {
    return this.state.player2;
  }
}
