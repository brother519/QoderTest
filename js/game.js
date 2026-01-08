// 羊了个羊游戏主逻辑
class Game {
    constructor() {
        // 游戏配置
        this.config = {
            cardTypes: ['🐑', '🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐨'],
            typesCount: 8,
            cardsPerType: 9,
            layers: 4,
            maxSlots: 7,
            cardSize: 60,
            boardWidth: 460,
            boardHeight: 400
        };

        // 游戏状态
        this.cards = [];
        this.slot = [];
        this.isAnimating = false;
        this.isGameOver = false;

        // DOM 元素
        this.gameBoard = document.getElementById('game-board');
        this.slotBar = document.getElementById('slot-bar');
        this.modal = document.getElementById('modal');
        this.restartBtn = document.getElementById('restart-btn');
        this.modalRestartBtn = document.getElementById('modal-restart-btn');

        // 绑定事件
        this.restartBtn.addEventListener('click', () => this.restart());
        this.modalRestartBtn.addEventListener('click', () => this.restart());
        this.gameBoard.addEventListener('click', (e) => this.handleBoardClick(e));

        // 初始化游戏
        this.initGame();
    }

    // 初始化游戏
    initGame() {
        this.cards = [];
        this.slot = [];
        this.isAnimating = false;
        this.isGameOver = false;
        this.gameBoard.innerHTML = '';
        this.clearSlots();
        this.hideModal();

        this.generateCards();
        this.renderCards();
        this.updateBlockedState();
    }

    // 生成卡片数据
    generateCards() {
        const totalCards = this.config.typesCount * this.config.cardsPerType;
        const cardTypesList = [];

        // 生成卡片类型列表（每种类型 cardsPerType 张）
        for (let i = 0; i < this.config.typesCount; i++) {
            const type = this.config.cardTypes[i];
            for (let j = 0; j < this.config.cardsPerType; j++) {
                cardTypesList.push(type);
            }
        }

        // 洗牌
        this.shuffle(cardTypesList);

        // 分配卡片到各层
        let cardId = 0;
        const cardsPerLayer = Math.ceil(totalCards / this.config.layers);

        for (let layer = 0; layer < this.config.layers; layer++) {
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
                    isInSlot: false,
                    element: null
                };
                this.cards.push(card);
                cardId++;
            }
        }
    }

    // Fisher-Yates 洗牌算法
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // 渲染卡片到 DOM
    renderCards() {
        this.cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.cardId = card.id;
            cardElement.textContent = card.type;
            cardElement.style.left = `${card.x}px`;
            cardElement.style.top = `${card.y}px`;
            cardElement.style.zIndex = card.layer * 100 + card.id % 100;

            card.element = cardElement;
            this.gameBoard.appendChild(cardElement);
        });
    }

    // 处理游戏板点击事件
    handleBoardClick(e) {
        if (this.isAnimating || this.isGameOver) return;

        const cardElement = e.target.closest('.card');
        if (!cardElement) return;

        const cardId = parseInt(cardElement.dataset.cardId);
        const card = this.cards.find(c => c.id === cardId);

        if (card && card.isClickable && !card.isInSlot) {
            this.handleCardClick(card);
        }
    }

    // 处理卡片点击
    handleCardClick(card) {
        // 检查槽位是否已满
        if (this.slot.length >= this.config.maxSlots) {
            this.gameOver(false);
            return;
        }

        this.isAnimating = true;

        // 添加卡片到槽位
        this.addToSlot(card);
    }

    // 添加卡片到槽位
    addToSlot(card) {
        card.isInSlot = true;
        this.slot.push(card);

        // 找到插入位置（按类型分组）
        const slotIndex = this.findSlotPosition(card);

        // 移动卡片到槽位
        this.moveCardToSlot(card, slotIndex);

        // 延迟执行后续操作
        setTimeout(() => {
            this.updateBlockedState();
            this.checkElimination();
            this.isAnimating = false;

            if (!this.isGameOver) {
                this.checkGameEnd();
            }
        }, 400);
    }

    // 找到槽位插入位置（相同类型相邻）
    findSlotPosition(newCard) {
        // 找到第一个相同类型的卡片位置
        for (let i = 0; i < this.slot.length - 1; i++) {
            if (this.slot[i].type === newCard.type) {
                // 插入到同类型最后一张后面
                let lastIndex = i;
                while (lastIndex + 1 < this.slot.length - 1 && 
                       this.slot[lastIndex + 1].type === newCard.type) {
                    lastIndex++;
                }
                return lastIndex + 1;
            }
        }
        return this.slot.length - 1;
    }

    // 移动卡片到槽位
    moveCardToSlot(card, index) {
        card.element.classList.add('moving');

        // 重新排列槽位中的卡片
        this.arrangeSlotCards();
    }

    // 排列槽位中的卡片
    arrangeSlotCards() {
        const slots = this.slotBar.querySelectorAll('.slot');
        
        // 清空所有槽位
        slots.forEach(slot => {
            slot.innerHTML = '';
            slot.classList.remove('has-card');
        });

        // 按类型重新排序槽位卡片
        this.slot.sort((a, b) => a.type.localeCompare(b.type));

        // 放置卡片到槽位
        this.slot.forEach((card, index) => {
            if (index < this.config.maxSlots) {
                const slot = slots[index];
                slot.classList.add('has-card');
                
                // 移除旧的定位样式，添加槽位样式
                card.element.classList.remove('moving');
                card.element.classList.add('in-slot');
                card.element.style.position = 'static';
                card.element.style.left = '';
                card.element.style.top = '';
                card.element.style.zIndex = '';
                
                slot.appendChild(card.element);
            }
        });
    }

    // 检查消除
    checkElimination() {
        const typeCount = {};

        // 统计每种类型的数量
        this.slot.forEach(card => {
            typeCount[card.type] = (typeCount[card.type] || 0) + 1;
        });

        // 找出数量达到3的类型
        for (const type in typeCount) {
            if (typeCount[type] >= 3) {
                this.eliminateCards(type);
                return; // 一次只消除一种类型
            }
        }
    }

    // 消除卡片
    eliminateCards(type) {
        const cardsToEliminate = [];

        // 找出要消除的3张卡片
        for (let i = 0; i < this.slot.length && cardsToEliminate.length < 3; i++) {
            if (this.slot[i].type === type) {
                cardsToEliminate.push(this.slot[i]);
            }
        }

        // 播放消除动画
        cardsToEliminate.forEach(card => {
            card.element.classList.add('eliminating');
        });

        // 延迟移除卡片
        setTimeout(() => {
            cardsToEliminate.forEach(card => {
                const index = this.slot.indexOf(card);
                if (index > -1) {
                    this.slot.splice(index, 1);
                }
                if (card.element && card.element.parentNode) {
                    card.element.remove();
                }
            });

            // 重新排列槽位
            this.arrangeSlotCards();

            // 递归检查是否还有可消除的
            this.checkElimination();
        }, 400);
    }

    // 更新遮挡状态
    updateBlockedState() {
        // 获取所有未进入槽位的卡片
        const activeCards = this.cards.filter(card => !card.isInSlot);

        activeCards.forEach(cardA => {
            cardA.isClickable = true;

            // 检查是否被其他卡片遮挡
            for (const cardB of activeCards) {
                if (cardB.layer > cardA.layer && this.isOverlapping(cardA, cardB)) {
                    cardA.isClickable = false;
                    break;
                }
            }

            // 更新视觉状态
            if (cardA.element) {
                if (cardA.isClickable) {
                    cardA.element.classList.remove('blocked');
                } else {
                    cardA.element.classList.add('blocked');
                }
            }
        });
    }

    // 检测两张卡片是否重叠
    isOverlapping(cardA, cardB) {
        const size = this.config.cardSize;
        const threshold = size * 0.5; // 重叠阈值，至少重叠50%才算遮挡

        const aLeft = cardA.x;
        const aRight = cardA.x + size;
        const aTop = cardA.y;
        const aBottom = cardA.y + size;

        const bLeft = cardB.x;
        const bRight = cardB.x + size;
        const bTop = cardB.y;
        const bBottom = cardB.y + size;

        // 计算重叠区域
        const overlapX = Math.max(0, Math.min(aRight, bRight) - Math.max(aLeft, bLeft));
        const overlapY = Math.max(0, Math.min(aBottom, bBottom) - Math.max(aTop, bTop));

        return overlapX >= threshold && overlapY >= threshold;
    }

    // 检查游戏结束
    checkGameEnd() {
        // 检查是否胜利（所有卡片都被消除）
        const remainingCards = this.cards.filter(card => !card.isInSlot).length;
        if (remainingCards === 0 && this.slot.length === 0) {
            this.gameOver(true);
            return;
        }

        // 检查是否失败（槽位满且无法消除）
        if (this.slot.length >= this.config.maxSlots) {
            const typeCount = {};
            this.slot.forEach(card => {
                typeCount[card.type] = (typeCount[card.type] || 0) + 1;
            });

            const canEliminate = Object.values(typeCount).some(count => count >= 3);
            if (!canEliminate) {
                this.gameOver(false);
            }
        }
    }

    // 游戏结束
    gameOver(isWin) {
        this.isGameOver = true;
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');

        if (isWin) {
            modalTitle.textContent = '🎉 恭喜通关！';
            modalMessage.textContent = '你成功消除了所有卡片！';
        } else {
            modalTitle.textContent = '💔 游戏失败';
            modalMessage.textContent = '槽位已满，再试一次吧！';
        }

        this.showModal();
    }

    // 清空槽位
    clearSlots() {
        const slots = this.slotBar.querySelectorAll('.slot');
        slots.forEach(slot => {
            slot.innerHTML = '';
            slot.classList.remove('has-card');
        });
    }

    // 显示弹窗
    showModal() {
        this.modal.classList.remove('hidden');
    }

    // 隐藏弹窗
    hideModal() {
        this.modal.classList.add('hidden');
    }

    // 重新开始游戏
    restart() {
        this.hideModal();
        this.initGame();
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
