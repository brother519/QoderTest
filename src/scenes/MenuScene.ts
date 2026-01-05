import Phaser from 'phaser';
import Button from '../ui/Button';
import Leaderboard from '../ui/Leaderboard';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';

export default class MenuScene extends Phaser.Scene {
  private leaderboard: Leaderboard;

  constructor() {
    super({ key: 'MenuScene' });
  }

  preload() {
    // 加载菜单需要的资源
    this.load.image('background', 'assets/images/backgrounds/background.svg');
  }

  create() {
    // 背景
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'background').setAlpha(0.5);

    // 游戏标题
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 200, '飞机大战', {
      fontSize: '64px',
      fill: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建排行榜UI
    this.leaderboard = new Leaderboard(this);

    // 开始游戏按钮
    const startButton = new Button(
      this,
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 50,
      '开始游戏',
      { fontSize: '36px' },
      () => {
        this.scene.start('GameScene');
      }
    );

    // 排行榜按钮
    const leaderboardButton = new Button(
      this,
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 20,
      '排行榜',
      { fontSize: '28px', backgroundColor: '#666666' },
      () => {
        this.leaderboard.toggle();
      }
    );

    // 退出按钮
    const exitButton = new Button(
      this,
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 90,
      '退出',
      { fontSize: '28px', backgroundColor: '#cc0000' },
      () => {
        // 在实际游戏中，这里可以关闭标签页或执行其他退出逻辑
        // 暂时只是显示提示
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150, '游戏已退出', {
          fontSize: '20px',
          fill: '#ff0000'
        }).setOrigin(0.5);
      }
    );

    // 添加ESC键退出功能
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.leaderboard['isVisible']) {
        this.leaderboard.hide();
      } else {
        // 可以选择退出游戏或执行其他操作
      }
    });
  }
}