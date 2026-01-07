// 资源加载管理器(简化版)

export class ResourceLoader {
    constructor() {
        this.images = {};
        this.sounds = {};
        this.loaded = 0;
        this.total = 0;
    }

    // 加载图片
    loadImage(key, src) {
        this.total++;
        const img = new Image();
        
        img.onload = () => {
            this.images[key] = img;
            this.loaded++;
            console.log(`图片加载完成: ${key} (${this.loaded}/${this.total})`);
        };
        
        img.onerror = () => {
            console.error(`图片加载失败: ${src}`);
            this.loaded++;
        };
        
        img.src = src;
    }

    // 加载音频(可选)
    loadSound(key, src) {
        this.total++;
        const audio = new Audio();
        
        audio.addEventListener('canplaythrough', () => {
            this.sounds[key] = audio;
            this.loaded++;
            console.log(`音频加载完成: ${key} (${this.loaded}/${this.total})`);
        });
        
        audio.addEventListener('error', () => {
            console.error(`音频加载失败: ${src}`);
            this.loaded++;
        });
        
        audio.src = src;
    }

    // 获取图片
    getImage(key) {
        return this.images[key];
    }

    // 获取音频
    getSound(key) {
        return this.sounds[key];
    }

    // 播放音效
    playSound(key, volume = 1.0) {
        const sound = this.sounds[key];
        if (sound) {
            const clone = sound.cloneNode();
            clone.volume = volume;
            clone.play().catch(e => console.warn('音频播放失败:', e));
        }
    }

    // 检查是否全部加载完成
    isAllLoaded() {
        return this.loaded === this.total && this.total > 0;
    }

    // 获取加载进度(0-1)
    getProgress() {
        return this.total === 0 ? 1 : this.loaded / this.total;
    }
}

// 单例模式
export const resourceLoader = new ResourceLoader();
