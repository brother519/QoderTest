// 计分管理器
class ScoreManager {
    constructor() {
        this.baseScore = 100;  // 基础消除分数
        this.timeBonus = 10;   // 时间奖励系数
        this.comboTimeout = 5000; // 连击超时时间(毫秒)
        this.reset();
    }

    reset() {
        this.currentScore = 0;
        this.comboCount = 0;
        this.lastRemoveTime = 0;
        this.totalPairs = 0;
    }

    // 计算连击倍数
    getComboMultiplier() {
        if (this.comboCount === 0) return 1.0;
        if (this.comboCount === 1) return 1.2;
        if (this.comboCount === 2) return 1.5;
        return 2.0; // 4次及以上
    }

    // 记录一次成功消除
    recordRemove() {
        const now = Date.now();
        
        // 检查是否超时,超时则重置连击
        if (this.lastRemoveTime > 0 && (now - this.lastRemoveTime) > this.comboTimeout) {
            this.comboCount = 0;
        }

        // 计算得分
        const multiplier = this.getComboMultiplier();
        const score = Math.floor(this.baseScore * multiplier);
        
        this.currentScore += score;
        this.comboCount++;
        this.lastRemoveTime = now;
        this.totalPairs++;

        return {
            score: score,
            combo: this.comboCount,
            multiplier: multiplier
        };
    }

    // 计算时间奖励
    calculateTimeBonus(remainingTime) {
        return remainingTime * this.timeBonus;
    }

    // 获取当前分数
    getCurrentScore() {
        return this.currentScore;
    }

    // 获取当前连击数
    getComboCount() {
        return this.comboCount;
    }

    // 检查连击是否过期
    checkComboExpired() {
        if (this.lastRemoveTime > 0) {
            const now = Date.now();
            if ((now - this.lastRemoveTime) > this.comboTimeout) {
                this.comboCount = 0;
                return true;
            }
        }
        return false;
    }

    // 获取总分(包括时间奖励)
    getTotalScore(remainingTime) {
        const timeBonus = this.calculateTimeBonus(remainingTime);
        return this.currentScore + timeBonus;
    }
}
