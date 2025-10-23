/**
 * 音频管理器
 * 使用Web Audio API管理游戏音效和背景音乐
 */
export class AudioManager {
    constructor() {
        // 音频上下文
        this.audioContext = null;
        this.sounds = new Map();
        this.musicSource = null;
        
        // 音量设置
        this.masterVolume = 1.0;
        this.sfxVolume = 0.7;
        this.musicVolume = 0.5;
        
        // 静音状态
        this.isMuted = false;
        
        // 初始化音频上下文（需要用户交互后才能创建）
        this.initAudioContext();
    }
    
    /**
     * 初始化音频上下文
     */
    initAudioContext() {
        // 监听用户首次交互
        const initAudio = () => {
            if (!this.audioContext) {
                try {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    console.log('Audio context initialized');
                } catch (e) {
                    console.warn('Web Audio API not supported', e);
                }
            }
            
            // 移除监听器
            document.removeEventListener('click', initAudio);
            document.removeEventListener('keydown', initAudio);
        };
        
        document.addEventListener('click', initAudio);
        document.addEventListener('keydown', initAudio);
    }
    
    /**
     * 创建音频缓冲区（使用振荡器生成简单音效）
     */
    createSoundBuffer(type, frequency, duration) {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const bufferSize = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const t = i / sampleRate;
            
            switch (type) {
                case 'shoot':
                    // 射击音效 - 短促的高频声音
                    data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 10);
                    break;
                    
                case 'explosion':
                    // 爆炸音效 - 低频噪音
                    data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 3);
                    break;
                    
                case 'hit':
                    // 击中音效 - 中频脉冲
                    data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 15);
                    break;
                    
                case 'powerup':
                    // 道具音效 - 上升音调
                    data[i] = Math.sin(2 * Math.PI * (frequency + t * 500) * t) * Math.exp(-t * 5);
                    break;
                    
                case 'gamestart':
                    // 游戏开始 - 欢快的音调
                    data[i] = Math.sin(2 * Math.PI * (frequency + Math.sin(t * 10) * 100) * t) * Math.exp(-t * 2);
                    break;
                    
                case 'gameover':
                    // 游戏结束 - 下降音调
                    data[i] = Math.sin(2 * Math.PI * (frequency - t * 200) * t) * Math.exp(-t * 3);
                    break;
                    
                default:
                    data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 5);
            }
        }
        
        return buffer;
    }
    
    /**
     * 加载所有音效
     */
    loadSounds() {
        if (!this.audioContext) {
            console.warn('Audio context not available');
            return;
        }
        
        // 生成各种音效
        this.sounds.set('shoot', this.createSoundBuffer('shoot', 800, 0.1));
        this.sounds.set('explosion', this.createSoundBuffer('explosion', 100, 0.3));
        this.sounds.set('hit', this.createSoundBuffer('hit', 600, 0.15));
        this.sounds.set('powerup', this.createSoundBuffer('powerup', 440, 0.4));
        this.sounds.set('baseDestroy', this.createSoundBuffer('explosion', 80, 0.5));
        this.sounds.set('gamestart', this.createSoundBuffer('gamestart', 523, 0.6));
        this.sounds.set('gameover', this.createSoundBuffer('gameover', 440, 0.8));
        this.sounds.set('levelComplete', this.createSoundBuffer('powerup', 880, 0.5));
        
        console.log('Sounds loaded:', this.sounds.size);
    }
    
    /**
     * 播放音效
     */
    playSound(soundName, volume = 1.0) {
        if (!this.audioContext || this.isMuted) return;
        
        // 如果音效还未加载，先加载
        if (this.sounds.size === 0) {
            this.loadSounds();
        }
        
        const buffer = this.sounds.get(soundName);
        if (!buffer) {
            console.warn(`Sound ${soundName} not found`);
            return;
        }
        
        try {
            // 创建音源
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            
            // 创建增益节点控制音量
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = this.masterVolume * this.sfxVolume * volume;
            
            // 连接节点
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // 播放
            source.start(0);
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    }
    
    /**
     * 播放背景音乐（循环）
     */
    playMusic() {
        if (!this.audioContext || this.isMuted) return;
        
        try {
            // 停止当前音乐
            this.stopMusic();
            
            // 创建简单的背景音乐（使用振荡器）
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // 设置音调序列（简单的旋律）
            const melody = [262, 294, 330, 349, 392, 440, 494, 523]; // C大调音阶
            let noteIndex = 0;
            
            oscillator.frequency.value = melody[0];
            
            // 每0.5秒切换音符
            const changeNote = () => {
                if (this.musicSource) {
                    noteIndex = (noteIndex + 1) % melody.length;
                    oscillator.frequency.value = melody[noteIndex];
                }
            };
            
            this.musicInterval = setInterval(changeNote, 500);
            
            // 设置音量
            gainNode.gain.value = this.masterVolume * this.musicVolume * 0.3;
            
            // 连接节点
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // 开始播放
            oscillator.start(0);
            
            this.musicSource = oscillator;
        } catch (e) {
            console.warn('Error playing music:', e);
        }
    }
    
    /**
     * 停止背景音乐
     */
    stopMusic() {
        if (this.musicSource) {
            try {
                this.musicSource.stop();
            } catch (e) {
                // 忽略已停止的错误
            }
            this.musicSource = null;
        }
        
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
    
    /**
     * 设置主音量
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * 设置音效音量
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * 设置音乐音量
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * 切换静音状态
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopMusic();
        }
        
        return this.isMuted;
    }
    
    /**
     * 设置静音
     */
    setMute(muted) {
        this.isMuted = muted;
        
        if (this.isMuted) {
            this.stopMusic();
        }
    }
    
    /**
     * 页面失去焦点时暂停音频
     */
    pause() {
        this.stopMusic();
    }
    
    /**
     * 页面获得焦点时恢复音频
     */
    resume() {
        if (!this.isMuted) {
            // 可以选择是否恢复背景音乐
            // this.playMusic();
        }
    }
}
