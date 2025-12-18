export class AudioManager {
    constructor() {
        this.sounds = {};
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        this.isMuted = false;
        this.currentMusic = null;
        
        this.audioContext = null;
        this.initialized = false;
    }
    
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }
    
    generateTone(frequency, duration, type = 'square') {
        if (!this.audioContext) {
            this.init();
        }
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        return { oscillator, gainNode, duration };
    }
    
    play(soundName) {
        if (this.isMuted) return;
        
        if (!this.audioContext) {
            this.init();
        }
        if (!this.audioContext) return;
        
        let sound;
        
        switch (soundName) {
            case 'fire':
                sound = this.generateTone(200, 0.1, 'square');
                if (sound) {
                    sound.oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
                }
                break;
            case 'explosion':
                sound = this.generateTone(100, 0.3, 'sawtooth');
                if (sound) {
                    sound.oscillator.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.3);
                }
                break;
            case 'powerup':
                sound = this.generateTone(400, 0.2, 'sine');
                if (sound) {
                    sound.oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
                    sound.oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.2);
                }
                break;
            case 'hit':
                sound = this.generateTone(150, 0.1, 'square');
                break;
            case 'gameover':
                this.playSequence([200, 180, 160, 140], 0.3);
                return;
            case 'win':
                this.playSequence([400, 500, 600, 800], 0.2);
                return;
            case 'levelup':
                this.playSequence([300, 400, 500], 0.15);
                return;
        }
        
        if (sound) {
            sound.oscillator.start();
            sound.oscillator.stop(this.audioContext.currentTime + sound.duration);
        }
    }
    
    playSequence(frequencies, noteDuration) {
        if (!this.audioContext) {
            this.init();
        }
        if (!this.audioContext || this.isMuted) return;
        
        frequencies.forEach((freq, index) => {
            const startTime = this.audioContext.currentTime + index * noteDuration;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(freq, startTime);
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration * 0.9);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + noteDuration);
        });
    }
    
    playMusic() {
    }
    
    pauseMusic() {
    }
    
    resumeMusic() {
    }
    
    stopMusic() {
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }
    
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    mute() {
        this.isMuted = true;
    }
    
    unmute() {
        this.isMuted = false;
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }
}
