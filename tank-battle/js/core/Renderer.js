import { GAME_CONFIG, TILE_COLORS, TILE_TYPE, DIRECTION } from '../utils/Constants.js';

// 渲染引擎
export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
    }

    // 清空画布
    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 绘制地图
    renderMap(map) {
        const tileSize = GAME_CONFIG.TILE_SIZE;
        
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                const tile = map.getTile(x, y);
                if (tile !== TILE_TYPE.EMPTY && tile !== TILE_TYPE.GRASS) {
                    this.ctx.fillStyle = TILE_COLORS[tile] || '#000';
                    this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    
                    // 为砖墙添加纹理效果
                    if (tile === TILE_TYPE.BRICK) {
                        this.drawBrickTexture(x * tileSize, y * tileSize, tileSize);
                    }
                    // 为钢墙添加金属效果
                    else if (tile === TILE_TYPE.STEEL) {
                        this.drawSteelTexture(x * tileSize, y * tileSize, tileSize);
                    }
                    // 为河流添加波纹效果
                    else if (tile === TILE_TYPE.RIVER) {
                        this.drawRiverTexture(x * tileSize, y * tileSize, tileSize);
                    }
                }
            }
        }
    }

    // 绘制草丛(在最上层)
    renderGrass(map) {
        const tileSize = GAME_CONFIG.TILE_SIZE;
        
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                const tile = map.getTile(x, y);
                if (tile === TILE_TYPE.GRASS) {
                    this.ctx.fillStyle = TILE_COLORS[TILE_TYPE.GRASS];
                    this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    this.drawGrassTexture(x * tileSize, y * tileSize, tileSize);
                }
            }
        }
    }

    // 砖墙纹理
    drawBrickTexture(x, y, size) {
        this.ctx.strokeStyle = '#5D3A1A';
        this.ctx.lineWidth = 1;
        // 横线
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + (size / 3) * i);
            this.ctx.lineTo(x + size, y + (size / 3) * i);
            this.ctx.stroke();
        }
        // 竖线
        for (let i = 0; i < 3; i++) {
            const offset = (i % 2) * (size / 4);
            this.ctx.beginPath();
            this.ctx.moveTo(x + (size / 2) + offset, y + (size / 3) * i);
            this.ctx.lineTo(x + (size / 2) + offset, y + (size / 3) * (i + 1));
            this.ctx.stroke();
        }
    }

    // 钢墙纹理
    drawSteelTexture(x, y, size) {
        this.ctx.fillStyle = '#A0A0A0';
        this.ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        this.ctx.strokeStyle = '#606060';
        this.ctx.strokeRect(x + 4, y + 4, size - 8, size - 8);
    }

    // 河流纹理
    drawRiverTexture(x, y, size) {
        this.ctx.strokeStyle = '#1E90FF';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + (size / 3) * i + size / 6);
            this.ctx.bezierCurveTo(
                x + size / 4, y + (size / 3) * i,
                x + size * 3 / 4, y + (size / 3) * i + size / 3,
                x + size, y + (size / 3) * i + size / 6
            );
            this.ctx.stroke();
        }
    }

    // 草丛纹理
    drawGrassTexture(x, y, size) {
        this.ctx.strokeStyle = '#006400';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const startX = x + Math.random() * size;
            const startY = y + size;
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(startX + (Math.random() - 0.5) * 6, y + Math.random() * size * 0.5);
            this.ctx.stroke();
        }
    }

    // 绘制基地
    renderBase(base) {
        if (!base || base.destroyed) return;
        
        const size = GAME_CONFIG.TILE_SIZE * 2;
        const x = base.x;
        const y = base.y;
        
        // 基地底色
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x, y, size, size);
        
        // 绘制鹰标志
        this.ctx.fillStyle = base.destroyed ? '#666' : '#FFD700';
        this.ctx.beginPath();
        // 简化的鹰形状
        this.ctx.moveTo(x + size / 2, y + 4);
        this.ctx.lineTo(x + size - 4, y + size / 2);
        this.ctx.lineTo(x + size / 2, y + size - 4);
        this.ctx.lineTo(x + 4, y + size / 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 中心点
        this.ctx.fillStyle = '#FF4500';
        this.ctx.beginPath();
        this.ctx.arc(x + size / 2, y + size / 2, 4, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // 绘制坦克
    renderTank(tank) {
        if (!tank || tank.destroyed) return;
        
        const ctx = this.ctx;
        const x = tank.x;
        const y = tank.y;
        const size = tank.size;
        
        ctx.save();
        ctx.translate(x + size / 2, y + size / 2);
        ctx.rotate((tank.direction * Math.PI) / 2);
        ctx.translate(-(x + size / 2), -(y + size / 2));
        
        // 坦克主体
        ctx.fillStyle = tank.color;
        ctx.fillRect(x + 4, y + 2, size - 8, size - 4);
        
        // 履带
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, 6, size);
        ctx.fillRect(x + size - 6, y, 6, size);
        
        // 履带纹理
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        for (let i = 0; i < size; i += 4) {
            ctx.beginPath();
            ctx.moveTo(x, y + i);
            ctx.lineTo(x + 6, y + i);
            ctx.moveTo(x + size - 6, y + i);
            ctx.lineTo(x + size, y + i);
            ctx.stroke();
        }
        
        // 炮塔
        ctx.fillStyle = tank.color;
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 炮管
        ctx.fillStyle = '#444';
        ctx.fillRect(x + size / 2 - 2, y - 2, 4, size / 2 + 2);
        
        ctx.restore();
        
        // 护盾效果
        if (tank.shielded) {
            ctx.strokeStyle = 'rgba(0, 191, 255, 0.7)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2 + 4, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // 绘制子弹
    renderBullet(bullet) {
        if (!bullet || bullet.destroyed) return;
        
        const ctx = this.ctx;
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(bullet.x + bullet.size / 2, bullet.y + bullet.size / 2, bullet.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // 绘制爆炸效果
    renderExplosion(explosion) {
        if (!explosion || explosion.finished) return;
        
        const ctx = this.ctx;
        const progress = explosion.progress;
        const size = explosion.size * (0.5 + progress * 0.5);
        const alpha = 1 - progress;
        
        // 外圈
        ctx.fillStyle = `rgba(255, 165, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // 内圈
        ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // 中心
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    // 绘制道具
    renderPowerUp(powerUp) {
        if (!powerUp || powerUp.collected) return;
        
        const ctx = this.ctx;
        const x = powerUp.x;
        const y = powerUp.y;
        const size = powerUp.size;
        
        // 闪烁效果
        const alpha = 0.5 + Math.sin(Date.now() / 100) * 0.5;
        ctx.fillStyle = powerUp.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
        ctx.fillRect(x, y, size, size);
        
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, size, size);
    }

    // 绘制菜单
    renderMenu() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, width, height);
        
        // 标题
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('超级坦克大战', width / 2, height / 3);
        
        // 提示
        ctx.fillStyle = '#FFF';
        ctx.font = '20px Courier New';
        const blink = Math.floor(Date.now() / 500) % 2;
        if (blink) {
            ctx.fillText('按 Enter 开始游戏', width / 2, height / 2);
        }
        
        // 版本信息
        ctx.fillStyle = '#666';
        ctx.font = '14px Courier New';
        ctx.fillText('v1.0', width / 2, height - 30);
    }

    // 绘制暂停界面
    renderPaused() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 36px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('游戏暂停', width / 2, height / 2);
        
        ctx.fillStyle = '#FFF';
        ctx.font = '18px Courier New';
        ctx.fillText('按 P 继续', width / 2, height / 2 + 40);
    }

    // 绘制游戏结束
    renderGameOver(score) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', width / 2, height / 3);
        
        ctx.fillStyle = '#FFF';
        ctx.font = '24px Courier New';
        ctx.fillText(`最终得分: ${score}`, width / 2, height / 2);
        
        ctx.font = '18px Courier New';
        const blink = Math.floor(Date.now() / 500) % 2;
        if (blink) {
            ctx.fillText('按 Enter 重新开始', width / 2, height / 2 + 60);
        }
    }

    // 绘制胜利界面
    renderVictory(score, level) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('胜利!', width / 2, height / 3);
        
        ctx.fillStyle = '#FFF';
        ctx.font = '24px Courier New';
        ctx.fillText(`关卡 ${level} 完成`, width / 2, height / 2 - 20);
        ctx.fillText(`得分: ${score}`, width / 2, height / 2 + 20);
        
        ctx.font = '18px Courier New';
        const blink = Math.floor(Date.now() / 500) % 2;
        if (blink) {
            ctx.fillText('按 Enter 进入下一关', width / 2, height / 2 + 80);
        }
    }

    // 绘制关卡过渡
    renderLevelTransition(level) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 36px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(`第 ${level} 关`, width / 2, height / 2);
    }
}
