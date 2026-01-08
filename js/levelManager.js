// 关卡管理器
class LevelManager {
    constructor() {
        this.levels = [];
        this.currentLevelIndex = 0;
        this.maxUnlockedLevel = 1;
        this.initLevels();
    }

    // 初始化所有关卡配置
    initLevels() {
        // 根据设计文档配置5个关卡
        this.levels = [
            new LevelConfig(1, 6, 6, 4, 120, 0),   // 6×6, 4种图案, 120秒
            new LevelConfig(2, 8, 8, 6, 150, 0),   // 8×8, 6种图案, 150秒
            new LevelConfig(3, 8, 8, 8, 120, 0),   // 8×8, 8种图案, 120秒
            new LevelConfig(4, 10, 10, 10, 180, 0), // 10×10, 10种图案, 180秒
            new LevelConfig(5, 10, 10, 12, 150, 0)  // 10×10, 12种图案, 150秒
        ];
    }

    // 获取当前关卡配置
    getCurrentLevel() {
        return this.levels[this.currentLevelIndex];
    }

    // 获取指定关卡配置
    getLevel(levelNumber) {
        if (levelNumber >= 1 && levelNumber <= this.levels.length) {
            return this.levels[levelNumber - 1];
        }
        return null;
    }

    // 进入下一关
    nextLevel() {
        if (this.currentLevelIndex < this.levels.length - 1) {
            this.currentLevelIndex++;
            this.updateMaxUnlockedLevel();
            return true;
        }
        return false; // 已是最后一关
    }

    // 设置当前关卡
    setCurrentLevel(levelNumber) {
        if (levelNumber >= 1 && levelNumber <= this.maxUnlockedLevel) {
            this.currentLevelIndex = levelNumber - 1;
            return true;
        }
        return false;
    }

    // 更新最大解锁关卡
    updateMaxUnlockedLevel() {
        const newLevel = this.currentLevelIndex + 1;
        if (newLevel > this.maxUnlockedLevel) {
            this.maxUnlockedLevel = newLevel;
            this.saveProgress();
        }
    }

    // 判断是否为最后一关
    isLastLevel() {
        return this.currentLevelIndex === this.levels.length - 1;
    }

    // 获取总关卡数
    getTotalLevels() {
        return this.levels.length;
    }

    // 保存进度到本地存储
    saveProgress() {
        localStorage.setItem('maxUnlockedLevel', this.maxUnlockedLevel);
    }

    // 从本地存储加载进度
    loadProgress() {
        const saved = localStorage.getItem('maxUnlockedLevel');
        if (saved) {
            this.maxUnlockedLevel = parseInt(saved);
        }
    }

    // 重置进度
    resetProgress() {
        this.currentLevelIndex = 0;
        this.maxUnlockedLevel = 1;
        localStorage.removeItem('maxUnlockedLevel');
    }
}
