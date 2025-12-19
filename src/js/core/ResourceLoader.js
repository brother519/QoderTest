export class ResourceLoader {
  constructor() {
    this.images = {};
    this.sounds = {};
    this.loaded = 0;
    this.total = 0;
  }

  loadImage(key, src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images[key] = img;
        this.loaded++;
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  loadSound(key, src) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => {
        this.sounds[key] = audio;
        this.loaded++;
        resolve(audio);
      };
      audio.onerror = reject;
      audio.src = src;
    });
  }

  async loadResources(resourceList) {
    this.total = resourceList.length;
    this.loaded = 0;
    
    const promises = resourceList.map(resource => {
      if (resource.type === 'image') {
        return this.loadImage(resource.key, resource.src);
      } else if (resource.type === 'sound') {
        return this.loadSound(resource.key, resource.src);
      }
    });

    try {
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Resource loading failed:', error);
      return false;
    }
  }

  getImage(key) {
    return this.images[key];
  }

  getSound(key) {
    return this.sounds[key];
  }

  getProgress() {
    return this.total === 0 ? 1 : this.loaded / this.total;
  }
}
