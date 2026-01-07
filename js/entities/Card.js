// Card.js - 卡片实体类
class Card {
    constructor(id, type, x, y, layer, width = GAME_CONFIG.CARD_WIDTH, height = GAME_CONFIG.CARD_HEIGHT) {
        this.id = id;                    // 卡片唯一标识
        this.type = type;                // 图案类型（1-12）
        this.x = x;                      // X坐标
        this.y = y;                      // Y坐标
        this.layer = layer;              // 层级（越大越靠上）
        this.width = width;              // 卡片宽度
        this.height = height;            // 卡片高度
        this.state = 'normal';           // 状态：'normal', 'selected', 'moving', 'removed'
        this.isClickable = true;         // 是否可点击
        this.scale = 1;                  // 缩放比例（用于动画）
        this.color = GAME_CONFIG.CARD_COLORS[type % GAME_CONFIG.CARD_COLORS.length]; // 卡片颜色
        this.selected = false;           // 是否被选中
        this.originalX = x;              // 原始X坐标（用于动画）
        this.originalY = y;              // 原始Y坐标（用于动画）
    }

    // 更新卡片状态
    update(deltaTime) {
        // 根据状态执行不同逻辑
        switch (this.state) {
            case 'moving':
                // 如果是移动状态，可以添加一些移动相关的逻辑
                break;
            case 'removed':
                // 如果是移除状态，可以逐渐缩小
                if (this.scale > 0) {
                    this.scale -= 0.05; // 每帧缩小一点
                    if (this.scale < 0) this.scale = 0;
                }
                break;
        }
    }

    // 绘制卡片（如果使用Canvas直接绘制）
    draw(ctx) {
        // 绘制逻辑在Canvas.js中实现，这里只保留数据结构
    }

    // 检查点是否在卡片内
    containsPoint(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }

    // 选中卡片
    select() {
        this.selected = true;
        this.state = 'selected';
    }

    // 取消选中
    deselect() {
        this.selected = false;
        this.state = 'normal';
    }

    // 设置为移动状态
    setMoving() {
        this.state = 'moving';
    }

    // 设置为移除状态
    setRemoved() {
        this.state = 'removed';
    }

    // 检查是否已移除
    isRemoved() {
        return this.state === 'removed' || this.scale <= 0;
    }

    // 获取卡片中心点
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    // 设置新位置
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    // 设置新层级
    setLayer(layer) {
        this.layer = layer;
    }

    // 克隆卡片
    clone() {
        const newCard = new Card(this.id, this.type, this.x, this.y, this.layer, this.width, this.height);
        newCard.state = this.state;
        newCard.isClickable = this.isClickable;
        newCard.scale = this.scale;
        newCard.color = this.color;
        newCard.selected = this.selected;
        newCard.originalX = this.originalX;
        newCard.originalY = this.originalY;
        return newCard;
    }

    // 获取卡片的边界框
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    // 检查与其他卡片的碰撞
    collidesWith(otherCard) {
        return this.x < otherCard.x + otherCard.width &&
               this.x + this.width > otherCard.x &&
               this.y < otherCard.y + otherCard.height &&
               this.y + this.height > otherCard.y;
    }
}