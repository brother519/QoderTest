export class Pool {
  constructor(createFunc, initialSize = 50) {
    this.createFunc = createFunc;
    this.pool = [];
    this.activeObjects = [];
    
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFunc());
    }
  }

  get() {
    let obj;
    
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.createFunc();
    }
    
    obj.active = true;
    this.activeObjects.push(obj);
    
    return obj;
  }

  release(obj) {
    obj.active = false;
    
    const index = this.activeObjects.indexOf(obj);
    if (index > -1) {
      this.activeObjects.splice(index, 1);
    }
    
    this.pool.push(obj);
  }

  releaseAll() {
    this.activeObjects.forEach(obj => {
      obj.active = false;
      this.pool.push(obj);
    });
    
    this.activeObjects = [];
  }

  update(deltaTime) {
    for (let i = this.activeObjects.length - 1; i >= 0; i--) {
      const obj = this.activeObjects[i];
      
      if (obj.update) {
        obj.update(deltaTime);
      }
      
      if (!obj.active) {
        this.release(obj);
      }
    }
  }

  render(ctx) {
    this.activeObjects.forEach(obj => {
      if (obj.render && obj.visible) {
        obj.render(ctx);
      }
    });
  }

  getActiveObjects() {
    return this.activeObjects;
  }

  getActiveCount() {
    return this.activeObjects.length;
  }

  getPoolSize() {
    return this.pool.length;
  }
}
