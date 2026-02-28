// UI管理器
export class UI {
    constructor() {
        this.levelDisplay = document.getElementById('level-display');
        this.livesDisplay = document.getElementById('lives-display');
        this.scoreDisplay = document.getElementById('score-display');
        this.enemiesDisplay = document.getElementById('enemies-display');
    }

    // 更新UI显示
    update(data) {
        if (this.levelDisplay) {
            this.levelDisplay.textContent = data.level;
        }
        if (this.livesDisplay) {
            this.livesDisplay.textContent = data.lives;
        }
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = data.score;
        }
        if (this.enemiesDisplay) {
            this.enemiesDisplay.textContent = data.enemies;
        }
    }
}
