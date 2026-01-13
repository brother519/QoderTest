export class Engine {
    constructor(game) {
        this.game = game;
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedTimeStep = 1 / 60;
        this.running = false;
    }

    start() {
        this.running = true;
        this.lastTime = performance.now() / 1000;
        this.gameLoop();
    }

    stop() {
        this.running = false;
    }

    gameLoop = () => {
        if (!this.running) return;

        const currentTime = performance.now() / 1000;
        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (deltaTime > 0.25) {
            deltaTime = 0.25;
        }

        this.accumulator += deltaTime;

        while (this.accumulator >= this.fixedTimeStep) {
            this.game.update(this.fixedTimeStep);
            this.accumulator -= this.fixedTimeStep;
        }

        this.game.render();

        requestAnimationFrame(this.gameLoop);
    }
}

export default Engine;
