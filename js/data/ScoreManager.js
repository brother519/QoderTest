export class ScoreManager {
    constructor(game) {
        this.game = game;
        this.score = 0;
        this.multiplier = 1;
        this.combo = 0;
        this.lastKillTime = 0;
        this.comboTimeout = 2000;
    }
    
    addScore(points, isKill = false) {
        if (isKill) {
            const now = performance.now();
            if (now - this.lastKillTime < this.comboTimeout) {
                this.combo++;
                this.multiplier = Math.min(4, 1 + this.combo * 0.5);
            } else {
                this.combo = 0;
                this.multiplier = 1;
            }
            this.lastKillTime = now;
        }
        
        const finalPoints = Math.floor(points * this.multiplier);
        this.score += finalPoints;
        
        return finalPoints;
    }
    
    getScore() {
        return this.score;
    }
    
    getMultiplier() {
        return this.multiplier;
    }
    
    getCombo() {
        return this.combo;
    }
    
    reset() {
        this.score = 0;
        this.multiplier = 1;
        this.combo = 0;
        this.lastKillTime = 0;
    }
    
    update(deltaTime) {
        const now = performance.now();
        if (this.combo > 0 && now - this.lastKillTime >= this.comboTimeout) {
            this.combo = 0;
            this.multiplier = 1;
        }
    }
}
