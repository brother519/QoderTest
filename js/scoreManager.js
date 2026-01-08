/**
 * 计分管理器
 * 负责游戏的计分系统，包括基础分数、连击倍数和时间奖励
 */
class ScoreManager {
    /**
     * 构造计分管理器
     */
    constructor() {
        this.baseScore = 100;      // 基础消除分数（每次成功消除的基础分）
        this.timeBonus = 10;       // 时间奖励系数（每秒剩余时间的奖励分）
        this.comboTimeout = 5000;  // 连击超时时间（毫秒），5秒内消除才算连击
        this.reset();              // 初始化状态
    }

    /**
     * 重置计分系统
     * 将所有计分相关的状态重置为初始值
     */
    reset() {
        this.currentScore = 0;    // 当前关卡的总分数
        this.comboCount = 0;      // 当前连击次数
        this.lastRemoveTime = 0;  // 最后一次消除的时间戳
        this.totalPairs = 0;      // 总共消除的配对数
    }

    /**
     * 计算连击倍数
     * 根据当前连击次数返回相应的分数倍数
     * @returns {number} 连击倍数（1.0 - 2.0）
     */
    getComboMultiplier() {
        if (this.comboCount === 0) return 1.0;  // 无连击，1倍
        if (this.comboCount === 1) return 1.2;  // 1连击，1.2倍
        if (this.comboCount === 2) return 1.5;  // 2连击，1.5倍
        return 2.0; // 3连击及以上，2倍
    }

    /**
     * 记录一次成功消除
     * 计算得分，更新连击数和总分
     * @returns {Object} 返回包含得分、连击数和倍数的对象
     */
    recordRemove() {
        const now = Date.now();  // 当前时间戳
        
        // 检查是否超时，超时则重置连击
        if (this.lastRemoveTime > 0 && (now - this.lastRemoveTime) > this.comboTimeout) {
            this.comboCount = 0;  // 超过5秒未消除，连击中断
        }

        // 计算得分
        const multiplier = this.getComboMultiplier();      // 获取当前连击倍数
        const score = Math.floor(this.baseScore * multiplier);  // 基础分 × 倍数
        
        this.currentScore += score;   // 累加到总分
        this.comboCount++;            // 连击数+1
        this.lastRemoveTime = now;    // 更新最后消除时间
        this.totalPairs++;            // 总配对数+1

        return {
            score: score,           // 本次消除得分
            combo: this.comboCount, // 当前连击数
            multiplier: multiplier  // 当前倍数
        };
    }

    /**
     * 计算时间奖励
     * 根据剩余时间计算奖励分数
     * @param {number} remainingTime - 剩余时间（秒）
     * @returns {number} 时间奖励分数
     */
    calculateTimeBonus(remainingTime) {
        return remainingTime * this.timeBonus;  // 每秒剩余时间 × 10分
    }

    /**
     * 获取当前分数
     * @returns {number} 当前关卡的总分数
     */
    getCurrentScore() {
        return this.currentScore;
    }

    /**
     * 获取当前连击数
     * @returns {number} 当前的连击次数
     */
    getComboCount() {
        return this.comboCount;
    }

    /**
     * 检查连击是否过期
     * 如果距离上次消除超过5秒，则连击中断
     * @returns {boolean} 连击过期返回true
     */
    checkComboExpired() {
        if (this.lastRemoveTime > 0) {
            const now = Date.now();
            if ((now - this.lastRemoveTime) > this.comboTimeout) {
                this.comboCount = 0;  // 重置连击数
                return true;          // 返回true表示连击已过期
            }
        }
        return false;  // 连击未过期
    }

    /**
     * 获取总分（包括时间奖励）
     * @param {number} remainingTime - 剩余时间（秒）
     * @returns {number} 关卡分数 + 时间奖励
     */
    getTotalScore(remainingTime) {
        const timeBonus = this.calculateTimeBonus(remainingTime);  // 计算时间奖励
        return this.currentScore + timeBonus;                      // 返回总分
    }
}
