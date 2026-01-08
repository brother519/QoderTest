/**
 * 关卡管理器
 * 负责管理所有关卡配置、进度保存和关卡切换
 */
class LevelManager {
    /**
     * 构造关卡管理器
     */
    constructor() {
        this.levels = [];           // 关卡配置数组
        this.currentLevelIndex = 0; // 当前关卡索引
        this.maxUnlockedLevel = 1;  // 最大解锁关卡编号
        this.initLevels();          // 初始化所有关卡
    }

    /**
     * 初始化所有关卡配置
     * 创建5个关卡，难度逐渐递增
     */
    initLevels() {
        // 根据设计文档配置5个关卡
        // 格式：new LevelConfig(关卡号, 行数, 列数, 图案种类, 时间限制, 目标分数)
        this.levels = [
            new LevelConfig(1, 6, 6, 4, 120, 0),    // 第1关: 6×6, 4种图案, 120秒
            new LevelConfig(2, 8, 8, 6, 150, 0),    // 第2关: 8×8, 6种图案, 150秒
            new LevelConfig(3, 8, 8, 8, 120, 0),    // 第3关: 8×8, 8种图案, 120秒
            new LevelConfig(4, 10, 10, 10, 180, 0), // 第4关: 10×10, 10种图案, 180秒
            new LevelConfig(5, 10, 10, 12, 150, 0)  // 第5关: 10×10, 12种图案, 150秒
        ];
    }

    /**
     * 获取当前关卡配置
     * @returns {LevelConfig} 当前关卡的配置对象
     */
    getCurrentLevel() {
        return this.levels[this.currentLevelIndex];
    }

    /**
     * 获取指定关卡配置
     * @param {number} levelNumber - 关卡编号（从1开始）
     * @returns {LevelConfig|null} 返回关卡配置，如果编号无效则返回null
     */
    getLevel(levelNumber) {
        if (levelNumber >= 1 && levelNumber <= this.levels.length) {
            return this.levels[levelNumber - 1];  // 编号从1开始，索引从0开始
        }
        return null;
    }

    /**
     * 进入下一关
     * 将当前关卡索引增加1，并更新解锁进度
     * @returns {boolean} 成功进入下一关返回true，已是最后一关返回false
     */
    nextLevel() {
        if (this.currentLevelIndex < this.levels.length - 1) {
            this.currentLevelIndex++;           // 进入下一关
            this.updateMaxUnlockedLevel();      // 更新解锁进度
            return true;
        }
        return false; // 已是最后一关
    }

    /**
     * 设置当前关卡
     * 只能设置已解锁的关卡
     * @param {number} levelNumber - 关卡编号（从1开始）
     * @returns {boolean} 设置成功返回true，失败返回false
     */
    setCurrentLevel(levelNumber) {
        // 检查关卡是否有效且已解锁
        if (levelNumber >= 1 && levelNumber <= this.maxUnlockedLevel) {
            this.currentLevelIndex = levelNumber - 1;  // 转换为索引
            return true;
        }
        return false;
    }

    /**
     * 更新最大解锁关卡
     * 当玩家通过关卡时调用，解锁下一关并保存进度
     */
    updateMaxUnlockedLevel() {
        const newLevel = this.currentLevelIndex + 1;  // 计算新关卡号
        if (newLevel > this.maxUnlockedLevel) {
            this.maxUnlockedLevel = newLevel;  // 更新最大解锁关卡
            this.saveProgress();               // 保存进度到本地
        }
    }

    /**
     * 判断是否为最后一关
     * @returns {boolean} 当前是最后一关返回true
     */
    isLastLevel() {
        return this.currentLevelIndex === this.levels.length - 1;
    }

    /**
     * 获取总关卡数
     * @returns {number} 返回游戏的总关卡数量
     */
    getTotalLevels() {
        return this.levels.length;
    }

    /**
     * 保存进度到本地存储
     * 使用localStorage保存最大解锁关卡
     */
    saveProgress() {
        localStorage.setItem('maxUnlockedLevel', this.maxUnlockedLevel);
    }

    /**
     * 从本地存储加载进度
     * 游戏启动时调用，恢复玩家之前的进度
     */
    loadProgress() {
        const saved = localStorage.getItem('maxUnlockedLevel');
        if (saved) {
            this.maxUnlockedLevel = parseInt(saved);  // 解析并设置解锁关卡
        }
    }

    /**
     * 重置进度
     * 将游戏进度重置到初始状态，仅解锁第一关
     */
    resetProgress() {
        this.currentLevelIndex = 0;   // 重置到第一关
        this.maxUnlockedLevel = 1;    // 重置解锁关卡
        localStorage.removeItem('maxUnlockedLevel');  // 清除本地存储
    }
}
