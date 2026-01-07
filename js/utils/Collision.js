// Collision.js - 碰撞检测与遮挡判断
class CollisionDetector {
    constructor() {
        // 预计算一些值以提高性能
    }

    // 检查点是否在矩形内
    isPointInRect(x, y, rectX, rectY, width, height) {
        return x >= rectX && x <= rectX + width && 
               y >= rectY && y <= rectY + height;
    }

    // 检查两个矩形是否重叠
    isRectOverlap(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    // 计算两个矩形的重叠面积
    getOverlapArea(rect1, rect2) {
        const left = Math.max(rect1.x, rect2.x);
        const right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
        const top = Math.max(rect1.y, rect2.y);
        const bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

        if (left < right && top < bottom) {
            return (right - left) * (bottom - top);
        }
        return 0;
    }

    // 检查卡片是否被其他卡片遮挡
    isCardBlocked(card, allCards) {
        // 计算卡片的包围盒
        const cardRect = {
            x: card.x,
            y: card.y,
            width: card.width,
            height: card.height
        };

        // 检查是否有层级更高的卡片遮挡当前卡片
        for (const otherCard of allCards) {
            // 跳过自己
            if (otherCard.id === card.id) continue;

            // 只检查层级高于当前卡片的卡片
            if (otherCard.layer <= card.layer) continue;

            // 检查矩形是否重叠
            if (this.isRectOverlap(cardRect, {
                x: otherCard.x,
                y: otherCard.y,
                width: otherCard.width,
                height: otherCard.height
            })) {
                // 计算重叠面积
                const overlapArea = this.getOverlapArea(cardRect, {
                    x: otherCard.x,
                    y: otherCard.y,
                    width: otherCard.width,
                    height: otherCard.height
                });

                // 检查重叠面积是否超过阈值
                const cardArea = card.width * card.height;
                const overlapRatio = overlapArea / cardArea;

                if (overlapRatio > GAME_CONFIG.BLOCK_THRESHOLD) {
                    return true; // 被遮挡
                }
            }
        }

        return false; // 未被遮挡
    }

    // 获取可点击的卡片列表
    getClickableCards(allCards) {
        const clickableCards = [];
        for (const card of allCards) {
            if (!this.isCardBlocked(card, allCards)) {
                clickableCards.push(card);
            }
        }
        return clickableCards;
    }

    // 检查点击位置是否有可点击的卡片
    getClickedCard(mouseX, mouseY, allCards) {
        // 从最高层级开始检查，找到第一个被点击的未遮挡卡片
        const sortedCards = [...allCards].sort((a, b) => b.layer - a.layer);

        for (const card of sortedCards) {
            // 检查点击点是否在卡片范围内
            if (this.isPointInRect(mouseX, mouseY, card.x, card.y, card.width, card.height)) {
                // 检查卡片是否被遮挡
                if (!this.isCardBlocked(card, allCards)) {
                    return card; // 找到可点击的卡片
                }
            }
        }

        return null; // 没有找到可点击的卡片
    }

    // 检查两个卡片是否重叠（用于布局验证）
    areCardsOverlapping(card1, card2) {
        return this.isRectOverlap(
            { x: card1.x, y: card1.y, width: card1.width, height: card1.height },
            { x: card2.x, y: card2.y, width: card2.width, height: card2.height }
        );
    }

    // 检查卡片是否在游戏区域内
    isCardInGameArea(card, gameWidth, gameHeight) {
        return card.x >= 0 && 
               card.x + card.width <= gameWidth &&
               card.y >= 0 && 
               card.y + card.height <= gameHeight;
    }
}

// 全局碰撞检测实例
const collisionDetector = new CollisionDetector();