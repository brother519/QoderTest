const shuffle = require('../utils/shuffle');
const { isOverlapping } = require('../utils/overlap-checker');

class GameLogicService {
    // 生成卡片数据
    static generateCards(levelConfig) {
        const { cardTypes, typesCount, cardsPerType, layers, cardSize, boardWidth, boardHeight } = levelConfig;
        const totalCards = typesCount * cardsPerType;
        const cardTypesList = [];

        // 生成卡片类型列表（每种类型 cardsPerType 张）
        for (let i = 0; i < typesCount; i++) {
            const type = cardTypes[i];
            for (let j = 0; j < cardsPerType; j++) {
                cardTypesList.push(type);
            }
        }

        // 洗牌
        shuffle(cardTypesList);

        // 分配卡片到各层
        const cards = [];
        let cardId = 0;
        const cardsPerLayer = Math.ceil(totalCards / layers);

        for (let layer = 0; layer < layers; layer++) {
            const layerCardCount = Math.min(cardsPerLayer, totalCards - cardId);
            const gridSize = Math.floor(Math.sqrt(layerCardCount)) + 1;

            for (let i = 0; i < layerCardCount && cardId < totalCards; i++) {
                const card = {
                    id: cardId,
                    type: cardTypesList[cardId],
                    layer: layer,
                    x: (i % gridSize) * 70 + Math.random() * 30,
                    y: Math.floor(i / gridSize) * 70 + Math.random() * 30,
                    isClickable: true,
                    isInSlot: false
                };
                cards.push(card);
                cardId++;
            }
        }

        return cards;
    }

    // 更新遮挡状态
    static updateBlockedState(cards, cardSize, overlapThreshold) {
        // 获取所有未进入槽位的卡片
        const activeCards = cards.filter(card => !card.isInSlot);

        activeCards.forEach(cardA => {
            cardA.isClickable = true;

            // 检查是否被其他卡片遮挡
            for (const cardB of activeCards) {
                if (cardB.layer > cardA.layer && isOverlapping(cardA, cardB, cardSize, overlapThreshold)) {
                    cardA.isClickable = false;
                    break;
                }
            }
        });

        return cards;
    }

    // 检查消除
    static checkElimination(slot) {
        const typeCount = {};

        // 统计每种类型的数量
        slot.forEach(card => {
            typeCount[card.type] = (typeCount[card.type] || 0) + 1;
        });

        // 找出数量达到3的类型
        for (const type in typeCount) {
            if (typeCount[type] >= 3) {
                return { canEliminate: true, eliminateType: type };
            }
        }

        return { canEliminate: false, eliminateType: null };
    }

    // 执行消除
    static eliminateCards(slot, eliminateType) {
        const eliminatedCards = [];
        const remainingSlot = [];

        let eliminatedCount = 0;
        for (const card of slot) {
            if (card.type === eliminateType && eliminatedCount < 3) {
                eliminatedCards.push(card);
                eliminatedCount++;
            } else {
                remainingSlot.push(card);
            }
        }

        return { eliminatedCards, remainingSlot };
    }

    // 添加卡片到槽位（按类型排序）
    static addCardToSlot(slot, card) {
        slot.push(card);
        // 按类型排序，相同类型的卡片相邻
        slot.sort((a, b) => a.type.localeCompare(b.type));
        return slot;
    }

    // 检查游戏结束
    static checkGameEnd(cards, slot, maxSlots) {
        // 检查是否胜利（所有卡片都被消除）
        const remainingCards = cards.filter(card => !card.isInSlot).length;
        if (remainingCards === 0 && slot.length === 0) {
            return { isGameOver: true, isWin: true };
        }

        // 检查是否失败（槽位满且无法消除）
        if (slot.length >= maxSlots) {
            const { canEliminate } = this.checkElimination(slot);
            if (!canEliminate) {
                return { isGameOver: true, isWin: false };
            }
        }

        return { isGameOver: false, isWin: false };
    }
}

module.exports = GameLogicService;
