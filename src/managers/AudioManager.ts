import Phaser from 'phaser';

export default class AudioManager {
  private scene: Phaser.Scene;
  private bgm: Phaser.Sound.BaseSound | null;
  private soundEffects: Map<string, string>; // 音效名称到文件路径的映射

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.bgm = null;
    
    // 音效映射（暂时使用占位符）
    this.soundEffects = new Map([
      ['shoot', 'assets/audio/sfx/shoot.mp3'],
      ['explosion', 'assets/audio/sfx/explosion.mp3'],
      ['powerup', 'assets/audio/sfx/powerup.mp3'],
      ['hurt', 'assets/audio/sfx/hurt.mp3']
    ]);
  }

  // 播放背景音乐
  playBGM(key: string, volume: number = 0.5) {
    if (this.bgm) {
      this.bgm.stop();
    }
    
    // 由于目前没有音频资源，我们使用占位符
    // 在实际游戏中，这里会加载和播放音频
    console.log(`Playing BGM: ${key} with volume ${volume}`);
    // this.bgm = this.scene.sound.add(key);
    // this.bgm.play({ loop: true, volume });
  }

  // 停止背景音乐
  stopBGM() {
    if (this.bgm) {
      this.bgm.stop();
      this.bgm = null;
    }
  }

  // 播放音效
  playSFX(key: string, volume: number = 0.7) {
    // 检查是否存在该音效
    if (this.soundEffects.has(key)) {
      // 在实际游戏中，这里会播放音效
      console.log(`Playing SFX: ${key} with volume ${volume}`);
      // const sound = this.scene.sound.add(key);
      // sound.play({ volume });
    } else {
      console.warn(`Sound effect '${key}' not found`);
    }
  }

  // 设置全局音量
  setVolume(volume: number) {
    this.scene.sound.setVolume(volume);
  }

  // 静音/取消静音
  setMute(mute: boolean) {
    this.scene.sound.setMute(mute);
  }
}