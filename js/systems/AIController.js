// AI控制系统（目前AI逻辑已集成在EnemyTank中）
class AIController {
    constructor() {}
    
    // 更新所有敌方坦克的AI
    update(enemyTanks, map, bullets) {
        for (let enemy of enemyTanks) {
            if (!enemy.alive) continue;
            
            // 更新AI移动
            enemy.update(0, map);
            
            // AI射击决策
            if (enemy.shouldShoot()) {
                const bullet = enemy.shoot();
                if (bullet) {
                    bullets.push(bullet);
                }
            }
        }
    }
}
