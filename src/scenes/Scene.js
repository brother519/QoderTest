/**
 * 场景基类
 */
export class Scene {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.engine = sceneManager.getEngine();
    }
    
    /**
     * 场景进入
     */
    enter(data) {
        // 子类实现
    }
    
    /**
     * 场景退出
     */
    exit() {
        // 子类实现
    }
    
    /**
     * 更新场景
     */
    update(deltaTime) {
        // 子类实现
    }
    
    /**
     * 渲染场景
     */
    render(renderer) {
        // 子类实现
    }
}
