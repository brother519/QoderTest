// Slot.js - 卡槽管理类
class SlotManager {
    constructor(capacity = GAME_CONFIG.SLOT_CAPACITY) {
        this.capacity = capacity;        // 卡槽容量
        this.cards = [];                 // 卡槽中的卡片数组
        this.cardCountByType = {};       // 按类型统计卡片数量
    }

    // 添加卡片到卡槽
    addCard(card) {
        // 检查卡槽是否已满
        if (this.cards.length >= this.capacity) {
            return false; // 卡槽已满，无法添加
        }

        // 添加卡片到数组
        this.cards.push(card);
        
        // 更新类型统计
        if (!this.cardCountByType[card.type]) {
            this.cardCountByType[card.type] = 0;
        }
        this.cardCountByType[card.type]++;
        
        // 检查是否有三张相同类型的卡片
        const removedCards = this.checkAndRemove();
        
        return { success: true, removedCards: removedCards };
    }

    // 检查并移除三张相同类型的卡片
    checkAndRemove() {
        const removedCards = [];
        
        // 查找数量>=3的卡片类型
        for (const type in this.cardCountByType) {
            if (this.cardCountByType[type] >= 3) {
                // 找到3张该类型的卡片进行移除
                let removedOfType = 0;
                for (let i = this.cards.length - 1; i >= 0 && removedOfType < 3; i--) {
                    if (this.cards[i].type == type) {
                        const removedCard = this.cards.splice(i, 1)[0];
                        removedCard.setRemoved(); // 设置为移除状态
                        removedCards.push(removedCard);
                        removedOfType++;
                    }
                }
                
                // 更新统计
                this.cardCountByType[type] -= 3;
                if (this.cardCountByType[type] === 0) {
                    delete this.cardCountByType[type];
                }
            }
        }
        
        return removedCards;
    }

    // 检查卡槽是否已满
    isFull() {
        return this.cards.length >= this.capacity;
    }

    // 检查是否即将满（添加一张卡片后会满且无法消除）
    isAboutToFull(cardType) {
        if (this.cards.length < this.capacity - 1) {
            return false; // 还有空间
        }
        
        // 如果卡槽已经满了
        if (this.cards.length === this.capacity) {
            return true;
        }
        
        // 如果再加一张就满了，检查加上这张后是否能消除
        const tempCount = { ...this.cardCountByType };
        tempCount[cardType] = (tempCount[cardType] || 0) + 1;
        
        // 检查加上这张卡片后是否能形成3张或以上
        return tempCount[cardType] < 3;
    }

    // 获取卡槽中卡片的数量
    getCardCount() {
        return this.cards.length;
    }

    // 获取卡槽中特定类型的卡片数量
    getCardCountByType(type) {
        return this.cardCountByType[type] || 0;
    }

    // 获取卡槽中所有卡片类型
    getCardTypes() {
        return Object.keys(this.cardCountByType).map(Number);
    }

    // 获取卡槽中所有卡片
    getCards() {
        return [...this.cards]; // 返回副本
    }

    // 清空卡槽
    clear() {
        this.cards = [];
        this.cardCountByType = {};
    }

    // 获取卡槽状态（用于保存/恢复游戏）
    getState() {
        return {
            capacity: this.capacity,
            cards: this.cards.map(card => ({
                id: card.id,
                type: card.type,
                x: card.x,
                y: card.y,
                layer: card.layer
            })),
            cardCountByType: { ...this.cardCountByType }
        };
    }

    // 从状态恢复卡槽
    setState(state) {
        this.capacity = state.capacity;
        this.cards = state.cards.map(data => 
            new Card(data.id, data.type, data.x, data.y, data.layer)
        );
        this.cardCountByType = { ...state.cardCountByType };
    }

    // 获取卡槽中特定位置的卡片
    getCardAt(index) {
        if (index < 0 || index >= this.cards.length) {
            return null;
        }
        return this.cards[index];
    }

    // 移除卡槽中特定类型的卡片（用于道具）
    removeCardsByType(type, count = 1) {
        const removedCards = [];
        
        // 从后往前遍历，避免索引问题
        for (let i = this.cards.length - 1; i >= 0 && removedCards.length < count; i--) {
            if (this.cards[i].type === type) {
                const removedCard = this.cards.splice(i, 1)[0];
                removedCard.setRemoved();
                removedCards.push(removedCard);
                
                // 更新统计
                this.cardCountByType[type]--;
                if (this.cardCountByType[type] === 0) {
                    delete this.cardCountByType[type];
                }
            }
        }
        
        return removedCards;
    }

    // 获取最接近满的类型（用于提示）
    getMostCompleteType() {
        let mostCompleteType = null;
        let maxCount = 0;
        
        for (const type in this.cardCountByType) {
            const count = this.cardCountByType[type];
            if (count > maxCount) {
                maxCount = count;
                mostCompleteType = parseInt(type);
            }
        }
        
        return { type: mostCompleteType, count: maxCount };
    }

    // 检查是否可以放置特定类型的卡片而不导致失败
    canPlaceWithoutFailing(type) {
        // 如果卡槽未满，或者加上这个类型后能消除，或者这个类型当前数量少于2
        const currentCount = this.cardCountByType[type] || 0;
        return this.cards.length < this.capacity || currentCount >= 2;
    }
}