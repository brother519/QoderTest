export class SceneManager {
    constructor() {
        this.scenes = {};
        this.sceneStack = [];
    }
    
    registerScene(name, scene) {
        this.scenes[name] = scene;
    }
    
    pushScene(name) {
        if (this.sceneStack.length > 0) {
            const currentScene = this.sceneStack[this.sceneStack.length - 1];
            if (currentScene.exit) {
                currentScene.exit();
            }
        }
        
        const scene = this.scenes[name];
        if (scene) {
            this.sceneStack.push(scene);
            if (scene.enter) {
                scene.enter();
            }
        }
    }
    
    popScene() {
        if (this.sceneStack.length > 0) {
            const scene = this.sceneStack.pop();
            if (scene.exit) {
                scene.exit();
            }
        }
        
        if (this.sceneStack.length > 0) {
            const currentScene = this.sceneStack[this.sceneStack.length - 1];
            if (currentScene.enter) {
                currentScene.enter();
            }
        }
    }
    
    changeScene(name) {
        while (this.sceneStack.length > 0) {
            const scene = this.sceneStack.pop();
            if (scene.exit) {
                scene.exit();
            }
        }
        this.pushScene(name);
    }
    
    update(deltaTime) {
        if (this.sceneStack.length > 0) {
            const currentScene = this.sceneStack[this.sceneStack.length - 1];
            if (currentScene.update) {
                currentScene.update(deltaTime);
            }
        }
    }
    
    render(ctx) {
        if (this.sceneStack.length > 0) {
            const currentScene = this.sceneStack[this.sceneStack.length - 1];
            if (currentScene.render) {
                currentScene.render(ctx);
            }
        }
    }
    
    getCurrentScene() {
        return this.sceneStack.length > 0 ? this.sceneStack[this.sceneStack.length - 1] : null;
    }
}
