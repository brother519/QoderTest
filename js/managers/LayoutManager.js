// LayoutManager.js - 卡片布局算法
class LayoutManager {
    constructor() {
        this.padding = 10; // 布局内部边距
    }

    // 生成布局 - 主要方法
    generateLayout(cards, layoutConfig) {
        // 根据布局类型选择相应的算法
        switch (layoutConfig.type) {
            case 'pyramid':
                return this.generatePyramidLayout(cards, layoutConfig);
            case 'grid':
                return this.generateGridLayout(cards, layoutConfig);
            case 'random':
                return this.generateRandomLayout(cards, layoutConfig);
            default:
                return this.generatePyramidLayout(cards, layoutConfig);
        }
    }

    // 金字塔布局算法
    generatePyramidLayout(cards, layoutConfig) {
        const rows = layoutConfig.rows || 5;
        const cols = layoutConfig.cols || 8;
        const baseLayer = layoutConfig.layerConfig?.baseLayer || 0;
        const layerSpacing = layoutConfig.layerConfig?.layerSpacing || 1;
        
        // 计算卡片大小和间距
        const cardWidth = GAME_CONFIG.CARD_WIDTH;
        const cardHeight = GAME_CONFIG.CARD_HEIGHT;
        const horizontalSpacing = (GAME_CONFIG.GAME_WIDTH - cols * cardWidth) / (cols + 1);
        const verticalSpacing = (GAME_CONFIG.GAME_HEIGHT/2 - rows * cardHeight) / (rows + 1);
        
        // 创建一个副本用于分配
        const cardsToPlace = [...cards];
        
        // 用于存储位置的二维数组，每个位置包含该位置的卡片和层级
        const positions = [];
        
        // 生成金字塔结构
        for (let row = 0; row < rows; row++) {
            const cardsInThisRow = Math.max(1, cols - row); // 每行的卡片数递减
            const startX = (GAME_CONFIG.GAME_WIDTH - (cardsInThisRow * (cardWidth + horizontalSpacing) - horizontalSpacing)) / 2;
            
            for (let col = 0; col < cardsInThisRow; col++) {
                if (cardsToPlace.length === 0) break;
                
                const card = cardsToPlace.pop();
                const x = startX + col * (cardWidth + horizontalSpacing);
                const y = 50 + row * (cardHeight + verticalSpacing); // 从50px开始，留出顶部空间
                const layer = baseLayer + row * layerSpacing; // 层级随行数增加
                
                card.x = x;
                card.y = y;
                card.layer = layer;
                
                positions.push({ card, x, y, layer, row, col });
            }
            
            if (cardsToPlace.length === 0) break;
        }
        
        // 如果还有剩余卡片，将它们放在底层（确保总数正确）
        while (cardsToPlace.length > 0) {
            const card = cardsToPlace.pop();
            // 找一个合适的位置放在底层
            const lastRowY = 50 + (rows - 1) * (cardHeight + verticalSpacing);
            const availableX = this.findAvailableXPosition(positions, lastRowY, cardWidth, cardHeight);
            
            card.x = availableX;
            card.y = lastRowY;
            card.layer = baseLayer;
        }
        
        return cards;
    }

    // 网格布局算法
    generateGridLayout(cards, layoutConfig) {
        const rows = layoutConfig.rows || 4;
        const cols = layoutConfig.cols || 6;
        const baseLayer = layoutConfig.layerConfig?.baseLayer || 0;
        const layerSpacing = layoutConfig.layerConfig?.layerSpacing || 1;
        
        const cardWidth = GAME_CONFIG.CARD_WIDTH;
        const cardHeight = GAME_CONFIG.CARD_HEIGHT;
        
        // 计算间距
        const horizontalSpacing = (GAME_CONFIG.GAME_WIDTH - cols * cardWidth) / (cols + 1);
        const verticalSpacing = (GAME_CONFIG.GAME_HEIGHT - rows * cardHeight) / (rows + 1);
        
        const cardsToPlace = [...cards];
        
        // 生成多层网格
        for (let layerIdx = 0; layerIdx < Math.ceil(cards.length / (rows * cols)); layerIdx++) {
            for (let row = 0; row < rows && cardsToPlace.length > 0; row++) {
                for (let col = 0; col < cols && cardsToPlace.length > 0; col++) {
                    const card = cardsToPlace.pop();
                    const x = horizontalSpacing + col * (cardWidth + horizontalSpacing);
                    const y = 30 + row * (cardHeight + verticalSpacing);
                    const layer = baseLayer + layerIdx * layerSpacing;
                    
                    card.x = x;
                    card.y = y;
                    card.layer = layer;
                }
            }
        }
        
        return cards;
    }

    // 随机布局算法
    generateRandomLayout(cards, layoutConfig) {
        const baseLayer = layoutConfig.layerConfig?.baseLayer || 0;
        const layerSpacing = layoutConfig.layerConfig?.layerSpacing || 1;
        const maxLayers = layoutConfig.layerConfig?.maxLayers || 5;
        
        const cardWidth = GAME_CONFIG.CARD_WIDTH;
        const cardHeight = GAME_CONFIG.CARD_HEIGHT;
        
        const cardsToPlace = [...cards];
        const positions = [];
        
        // 随机分配卡片到不同层级和位置
        for (let i = 0; i < cardsToPlace.length; i++) {
            const card = cardsToPlace[i];
            
            // 随机选择层级（确保底层卡片在下面）
            let layer;
            if (i < cardsToPlace.length * 0.3) {
                // 30% 的卡片放在最底层
                layer = baseLayer;
            } else if (i < cardsToPlace.length * 0.7) {
                // 40% 的卡片放在中间层
                layer = baseLayer + Math.floor(Math.random() * (maxLayers - 1)) + 1;
            } else {
                // 30% 的卡片放在顶层
                layer = baseLayer + maxLayers - 1;
            }
            
            // 寻找一个不与其他卡片重叠的位置
            let x, y;
            let positionFound = false;
            let attempts = 0;
            const maxAttempts = 100;
            
            while (!positionFound && attempts < maxAttempts) {
                // 随机生成位置，但确保在游戏区域内
                x = this.padding + Math.random() * (GAME_CONFIG.GAME_WIDTH - cardWidth - 2 * this.padding);
                y = this.padding + Math.random() * (GAME_CONFIG.GAME_HEIGHT/1.5 - cardHeight - 2 * this.padding);
                
                // 检查是否与已放置的卡片重叠
                let overlap = false;
                for (const pos of positions) {
                    if (pos.layer >= layer) { // 只检查同层或上层的卡片
                        const rect1 = { x, y, width: cardWidth, height: cardHeight };
                        const rect2 = { x: pos.x, y: pos.y, width: cardWidth, height: cardHeight };
                        
                        if (collisionDetector.isRectOverlap(rect1, rect2)) {
                            overlap = true;
                            break;
                        }
                    }
                }
                
                if (!overlap) {
                    positionFound = true;
                }
                attempts++;
            }
            
            // 如果尝试多次仍未找到合适位置，稍微调整位置
            if (!positionFound) {
                x = this.padding + (i % 10) * (cardWidth + 5);
                y = this.padding + Math.floor(i / 10) * (cardHeight + 5);
            }
            
            card.x = x;
            card.y = y;
            card.layer = layer;
            
            positions.push({ x, y, layer });
        }
        
        return cards;
    }

    // 验证布局是否可解
    validateLayout(cards) {
        // 检查是否有至少一张可点击的卡片
        const clickableCards = collisionDetector.getClickableCards(cards);
        if (clickableCards.length === 0) {
            console.warn('生成的布局不可解：没有可点击的卡片');
            return false;
        }
        
        // 检查布局是否符合游戏区域限制
        for (const card of cards) {
            if (!collisionDetector.isCardInGameArea(card, GAME_CONFIG.GAME_WIDTH, GAME_CONFIG.GAME_HEIGHT)) {
                console.warn('卡片超出游戏区域');
                return false;
            }
        }
        
        return true;
    }

    // 生成可解布局（使用反向生成算法）
    generateSolvableLayout(cards, layoutConfig) {
        // 生成基础布局
        const arrangedCards = this.generateLayout([...cards], layoutConfig);
        
        // 验证并调整布局直到可解
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            if (this.validateLayout(arrangedCards)) {
                return arrangedCards;
            }
            
            // 如果布局不可解，稍微调整
            this.adjustLayoutForSolvability(arrangedCards, layoutConfig);
            attempts++;
        }
        
        // 如果多次尝试后仍不可解，返回原始布局
        console.warn('无法生成完全可解的布局，返回基础布局');
        return arrangedCards;
    }

    // 调整布局以提高可解性
    adjustLayoutForSolvability(cards, layoutConfig) {
        // 确保至少有几张底层卡片可以被点击
        const sortedCards = [...cards].sort((a, b) => a.layer - b.layer);
        
        // 确保最底层有几张卡片不被完全遮挡
        for (let i = 0; i < Math.min(5, sortedCards.length); i++) {
            const card = sortedCards[i];
            // 确保底层卡片不被完全覆盖
            card.layer = layoutConfig.layerConfig?.baseLayer || 0;
        }
    }

    // 找到可用的X位置（用于补充卡片）
    findAvailableXPosition(positions, y, cardWidth, cardHeight) {
        // 简单的从左到右寻找可用位置
        let x = this.padding;
        const maxTries = 20;
        let tries = 0;
        
        while (tries < maxTries) {
            let isPositionAvailable = true;
            
            for (const pos of positions) {
                if (pos.y <= y + cardHeight && 
                    pos.y + GAME_CONFIG.CARD_HEIGHT >= y &&
                    pos.x <= x + cardWidth && 
                    pos.x + GAME_CONFIG.CARD_WIDTH >= x) {
                    // 位置被占用，尝试下一个位置
                    x = pos.x + GAME_CONFIG.CARD_WIDTH + 5;
                    isPositionAvailable = false;
                    break;
                }
            }
            
            if (isPositionAvailable) {
                return x;
            }
            
            tries++;
        }
        
        // 如果没找到合适位置，返回一个默认位置
        return this.padding + (positions.length % 10) * (cardWidth + 5);
    }

    // 生成对称布局（额外功能）
    generateSymmetricLayout(cards, layoutConfig) {
        const rows = layoutConfig.rows || 4;
        const cols = layoutConfig.cols || 6;
        const baseLayer = layoutConfig.layerConfig?.baseLayer || 0;
        
        const cardWidth = GAME_CONFIG.CARD_WIDTH;
        const cardHeight = GAME_CONFIG.CARD_HEIGHT;
        const horizontalSpacing = (GAME_CONFIG.GAME_WIDTH - cols * cardWidth) / (cols + 1);
        
        const cardsToPlace = [...cards];
        const halfCols = Math.floor(cols / 2);
        
        // 对称放置卡片
        for (let row = 0; row < rows && cardsToPlace.length >= 2; row++) {
            for (let col = 0; col < halfCols && cardsToPlace.length >= 2; col++) {
                // 左右对称放置两张相同的卡片
                const card1 = cardsToPlace.pop();
                const card2 = cardsToPlace.pop();
                
                const x1 = horizontalSpacing + col * (cardWidth + horizontalSpacing);
                const x2 = GAME_CONFIG.GAME_WIDTH - horizontalSpacing - (col + 1) * (cardWidth + horizontalSpacing);
                const y = 30 + row * (cardHeight + 10);
                
                card1.x = x1;
                card1.y = y;
                card1.layer = baseLayer + row;
                
                card2.x = x2;
                card2.y = y;
                card2.layer = baseLayer + row;
            }
        }
        
        // 放置剩余的卡片
        while (cardsToPlace.length > 0) {
            const card = cardsToPlace.pop();
            card.x = Math.random() * (GAME_CONFIG.GAME_WIDTH - cardWidth);
            card.y = Math.random() * (GAME_CONFIG.GAME_HEIGHT/2);
            card.layer = baseLayer;
        }
        
        return cards;
    }

    // 获取布局统计信息
    getLayoutStats(cards, layoutConfig) {
        const layers = {};
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        
        for (const card of cards) {
            // 统计各层卡片数量
            if (!layers[card.layer]) {
                layers[card.layer] = 0;
            }
            layers[card.layer]++;
            
            // 计算边界
            minX = Math.min(minX, card.x);
            maxX = Math.max(maxX, card.x + card.width);
            minY = Math.min(minY, card.y);
            maxY = Math.max(maxY, card.y + card.height);
        }
        
        return {
            totalCards: cards.length,
            layers: Object.keys(layers).length,
            cardsPerLayer: layers,
            boundary: { minX, maxX, minY, maxY },
            layoutType: layoutConfig.type
        };
    }
}