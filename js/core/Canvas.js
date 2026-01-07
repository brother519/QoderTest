// Canvas.js - Canvas渲染引擎
class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // 设置设备像素比以支持高清屏
        const dpr = window.devicePixelRatio || 1;
        if (dpr !== 1) {
            this.canvas.width = this.width * dpr;
            this.canvas.height = this.height * dpr;
            this.canvas.style.width = this.width + 'px';
            this.canvas.style.height = this.height + 'px';
            this.ctx.scale(dpr, dpr);
        }
    }

    // 清空画布
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    // 绘制卡片
    drawCard(card) {
        const ctx = this.ctx;
        
        // 保存当前状态
        ctx.save();
        
        // 如果卡片有缩放（如动画中），应用变换
        if (card.scale !== undefined && card.scale !== 1) {
            ctx.translate(card.x + card.width / 2, card.y + card.height / 2);
            ctx.scale(card.scale, card.scale);
            ctx.translate(-(card.x + card.width / 2), -(card.y + card.height / 2));
        }
        
        // 设置样式
        ctx.fillStyle = card.color || GAME_CONFIG.CARD_COLORS[card.type % GAME_CONFIG.CARD_COLORS.length];
        ctx.strokeStyle = card.selected ? '#FFD700' : (card.isClickable ? '#FFFFFF' : '#CCCCCC');
        ctx.lineWidth = card.selected ? 3 : (card.isClickable ? 2 : 1);
        
        // 绘制圆角矩形
        this.roundRect(ctx, card.x, card.y, card.width, card.height, 5);
        ctx.fill();
        ctx.stroke();
        
        // 如果卡片被遮挡，降低透明度
        if (!card.isClickable) {
            ctx.globalAlpha = 0.6;
            this.roundRect(ctx, card.x, card.y, card.width, card.height, 5);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
        
        // 绘制图案/数字
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(card.type, card.x + card.width / 2, card.y + card.height / 2);
        
        // 恢复状态
        ctx.restore();
    }

    // 绘制圆角矩形的辅助函数
    roundRect(ctx, x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
    }

    // 绘制所有卡片
    drawCards(cards) {
        // 按层级排序，先绘制层级低的，再绘制层级高的
        const sortedCards = [...cards].sort((a, b) => a.layer - b.layer);
        
        for (const card of sortedCards) {
            this.drawCard(card);
        }
    }

    // 绘制卡槽
    drawSlot(slotIndex, hasCard, cardType = null) {
        const slotContainer = document.getElementById('slotContainer');
        if (!slotContainer) return;

        // 动态创建卡槽元素
        if (slotContainer.children.length < GAME_CONFIG.SLOT_CAPACITY) {
            // 清空容器并重新创建所有卡槽
            slotContainer.innerHTML = '';
            for (let i = 0; i < GAME_CONFIG.SLOT_CAPACITY; i++) {
                const slotDiv = document.createElement('div');
                slotDiv.className = 'slot-slot';
                slotDiv.id = `slot-${i}`;
                slotContainer.appendChild(slotDiv);
            }
        }

        const slotElement = document.getElementById(`slot-${slotIndex}`);
        if (slotElement) {
            if (hasCard && cardType !== null) {
                slotElement.className = 'slot-slot has-card';
                // 设置背景色为对应卡片颜色
                const colorIndex = cardType % GAME_CONFIG.CARD_COLORS.length;
                slotElement.style.backgroundColor = GAME_CONFIG.CARD_COLORS[colorIndex];
                slotElement.textContent = cardType;
            } else {
                slotElement.className = 'slot-slot';
                slotElement.style.backgroundColor = '';
                slotElement.textContent = '';
            }
        }
    }

    // 绘制卡槽区域（在Canvas上）
    drawSlotArea(slots) {
        const slotAreaY = this.height - 100; // 卡槽区域在画布底部
        const slotWidth = 60;
        const slotHeight = 80;
        const slotSpacing = 10;
        
        for (let i = 0; i < GAME_CONFIG.SLOT_CAPACITY; i++) {
            const x = (this.width - (GAME_CONFIG.SLOT_CAPACITY * slotWidth + (GAME_CONFIG.SLOT_CAPACITY - 1) * slotSpacing)) / 2 + i * (slotWidth + slotSpacing);
            const y = slotAreaY;
            
            this.ctx.fillStyle = i < slots.length && slots[i] ? '#48bb78' : '#e2e8f0';
            this.ctx.strokeStyle = '#cbd5e0';
            this.ctx.lineWidth = 2;
            
            this.roundRect(this.ctx, x, y, slotWidth, slotHeight, 5);
            this.ctx.fill();
            this.ctx.stroke();
            
            // 如果槽位有卡片，绘制卡片类型
            if (i < slots.length && slots[i]) {
                this.ctx.fillStyle = 'white';
                this.ctx.font = 'bold 20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(slots[i].type, x + slotWidth / 2, y + slotHeight / 2);
            }
        }
    }

    // 绘制文本
    drawText(text, x, y, fontSize = 16, color = '#333', align = 'left') {
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, x, y);
    }

    // 绘制游戏背景
    drawBackground() {
        // 绘制渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#e0f7fa');
        gradient.addColorStop(1, '#bbdefb');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // 重置画布尺寸
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        
        const dpr = window.devicePixelRatio || 1;
        if (dpr !== 1) {
            this.canvas.width = width * dpr;
            this.canvas.height = height * dpr;
            this.canvas.style.width = width + 'px';
            this.canvas.style.height = height + 'px';
            this.ctx.scale(dpr, dpr);
        }
    }

    // 绘制网格（用于调试）
    drawGrid(cellSize = 40) {
        this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        this.ctx.lineWidth = 1;

        // 绘制垂直线
        for (let x = 0; x <= this.width; x += cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        // 绘制水平线
        for (let y = 0; y <= this.height; y += cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }
}