import { CONFIG } from '../config.js';

/**
 * 道具管理器
 */
export class PowerUpManager {
    constructor(gameScene) {
        this.gameScene = gameScene;
        this.activePowerUps = [];
    }
    
    /**
     * 生成道具
     */
    spawn(x, y) {
        if (Math.random() > CONFIG.POWERUP.SPAWN_CHANCE) {
            return;
        }
        
        // 随机选择道具类型
        const types = [
            CONFIG.POWERUP_TYPE.HELMET,
            CONFIG.POWERUP_TYPE.CLOCK,
            CONFIG.POWERUP_TYPE.BOMB,
            CONFIG.POWERUP_TYPE.SHOVEL,
            CONFIG.POWERUP_TYPE.TANK,
            CONFIG.POWERUP_TYPE.STAR
        ];
        
        const type = types[Math.floor(Math.random() * types.length)];
        
        this.activePowerUps.push({
            x, y,
            width: CONFIG.TILE_SIZE,
            height: CONFIG.TILE_SIZE,
            type,
            lifeTime: 600 // 10秒后消失
        });
    }
    
    /**
     * 更新道具
     */
    update(deltaTime) {
        this.activePowerUps = this.activePowerUps.filter(powerUp => {
            powerUp.lifeTime--;
            
            if (powerUp.lifeTime <= 0) {
                return false;
            }
            
            // 检查玩家是否拾取
            for (const player of this.gameScene.players) {
                if (!player.isAlive) continue;
                
                if (this.checkCollision(player, powerUp)) {
                    this.applyPowerUp(player, powerUp.type);
                    return false;
                }
            }
            
            return true;
        });
    }
    
    /**
     * 检查碰撞
     */
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    /**
     * 应用道具效果
     */
    applyPowerUp(player, type) {
        // 播放道具拾取音效
        this.gameScene.engine.audioManager.playSound('powerup', 0.5);
        
        switch (type) {
            case CONFIG.POWERUP_TYPE.HELMET:
                // 临时无敌
                player.isInvincible = true;
                player.invincibleTime = CONFIG.POWERUP.HELMET_DURATION;
                break;
                
            case CONFIG.POWERUP_TYPE.CLOCK:
                // 冻结所有敌人
                this.gameScene.enemyManager.freezeAll(CONFIG.POWERUP.CLOCK_DURATION);
                break;
                
            case CONFIG.POWERUP_TYPE.BOMB:
                // 消灭所有敌人
                this.gameScene.enemyManager.destroyAll();
                break;
                
            case CONFIG.POWERUP_TYPE.SHOVEL:
                // 基地周围变钢墙
                this.gameScene.map.fortifyBase(CONFIG.POWERUP.SHOVEL_DURATION);
                this.gameScene.base.activateShield(CONFIG.POWERUP.SHOVEL_DURATION);
                break;
                
            case CONFIG.POWERUP_TYPE.TANK:
                // 增加生命
                if (player.lives < CONFIG.TANK.MAX_LIVES) {
                    player.lives++;
                }
                break;
                
            case CONFIG.POWERUP_TYPE.STAR:
                // 升级坦克
                player.upgrade();
                break;
        }
    }
    
    /**
     * 渲染道具
     */
    render(renderer) {
        this.activePowerUps.forEach(powerUp => {
            // 简单的闪烁效果
            if (Math.floor(powerUp.lifeTime / 10) % 2 === 0) {
                const color = this.getPowerUpColor(powerUp.type);
                renderer.drawRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height, color);
                renderer.drawStrokeRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height, '#fff', 2);
                
                // 绘制图标文字
                const text = this.getPowerUpText(powerUp.type);
                renderer.drawText(text, powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, {
                    color: '#000',
                    font: 'bold 12px Arial',
                    align: 'center',
                    baseline: 'middle'
                });
            }
        });
    }
    
    /**
     * 获取道具颜色
     */
    getPowerUpColor(type) {
        const colors = {
            [CONFIG.POWERUP_TYPE.HELMET]: '#00ff00',
            [CONFIG.POWERUP_TYPE.CLOCK]: '#00ffff',
            [CONFIG.POWERUP_TYPE.BOMB]: '#ff0000',
            [CONFIG.POWERUP_TYPE.SHOVEL]: '#ffa500',
            [CONFIG.POWERUP_TYPE.TANK]: '#ffff00',
            [CONFIG.POWERUP_TYPE.STAR]: '#ff00ff'
        };
        return colors[type] || '#fff';
    }
    
    /**
     * 获取道具文字
     */
    getPowerUpText(type) {
        const texts = {
            [CONFIG.POWERUP_TYPE.HELMET]: '盔',
            [CONFIG.POWERUP_TYPE.CLOCK]: '钟',
            [CONFIG.POWERUP_TYPE.BOMB]: '弹',
            [CONFIG.POWERUP_TYPE.SHOVEL]: '铲',
            [CONFIG.POWERUP_TYPE.TANK]: '命',
            [CONFIG.POWERUP_TYPE.STAR]: '星'
        };
        return texts[type] || '?';
    }
}
