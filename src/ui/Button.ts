import Phaser from 'phaser';

export default class Button extends Phaser.GameObjects.Text {
  private originalBackgroundColor: number | undefined;
  private originalTextColor: string | undefined;
  private hoverBackgroundColor: number;
  private hoverTextColor: string;
  private isHovered: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    style?: Phaser.Types.GameObjects.Text.TextStyle,
    callback?: () => void
  ) {
    // 默认样式
    const defaultStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#0066cc',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    };
    
    super(scene, x, y, text, style ? { ...defaultStyle, ...style } : defaultStyle);
    
    // 保存原始样式
    this.originalBackgroundColor = this.style.backgroundColor as number;
    this.originalTextColor = this.style.fill as string;
    
    // 设置悬停样式
    this.hoverBackgroundColor = 0x0099ff;
    this.hoverTextColor = '#ffff00';
    this.isHovered = false;
    
    // 设置交互
    this.setInteractive({ useHandCursor: true });
    
    // 添加事件监听器
    this.on('pointerover', () => {
      this.handleHover(true);
    });
    
    this.on('pointerout', () => {
      this.handleHover(false);
    });
    
    if (callback) {
      this.on('pointerdown', callback);
    }
  }

  private handleHover(isOver: boolean) {
    if (isOver) {
      this.setBackgroundColor(this.hoverBackgroundColor);
      this.setFill(this.hoverTextColor);
      this.isHovered = true;
    } else {
      this.setBackgroundColor(this.originalBackgroundColor);
      this.setFill(this.originalTextColor!);
      this.isHovered = false;
    }
  }

  setHoverColors(bgColor: number, textColor: string) {
    this.hoverBackgroundColor = bgColor;
    this.hoverTextColor = textColor;
    
    if (this.isHovered) {
      this.handleHover(true);
    }
  }
}