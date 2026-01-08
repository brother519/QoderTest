// UI组件管理器
class UIManager {
    constructor() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.board = null;
        this.tileSize = 50;
        this.padding = 5;
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
            '#F8B4D9', '#A8E6CF', '#FFD3B6', '#FFAAA5'
        ];
    }

    // 显示主菜单
    showMainMenu() {
        this.hideAllScreens();
        document.getElementById('main-menu').classList.remove('hidden');
    }

    // 显示关卡选择界面
    showLevelSelect(maxUnlockedLevel, totalLevels) {
        this.hideAllScreens();
        const levelSelect = document.getElementById('level-select');
        const levelList = document.getElementById('level-list');
        
        levelList.innerHTML = '';
        for (let i = 1; i <= totalLevels; i++) {
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            btn.textContent = `关卡 ${i}`;
            btn.disabled = i > maxUnlockedLevel;
            btn.onclick = () => window.game.startLevelByNumber(i);
            levelList.appendChild(btn);
        }
        
        levelSelect.classList.remove('hidden');
    }

    // 显示游戏界面
    showGameScreen() {
        this.hideAllScreens();
        this.hideAllModals();
        document.getElementById('game-screen').classList.remove('hidden');
    }

    // 隐藏所有界面
    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
    }

    // 隐藏所有弹窗
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    // 更新关卡信息
    updateLevelInfo(level) {
        document.getElementById('current-level').textContent = level;
    }

    // 更新分数
    updateScore(score) {
        document.getElementById('current-score').textContent = score;
    }

    // 更新连击
    updateCombo(combo) {
        document.getElementById('combo-count').textContent = combo;
    }

    // 更新时间
    updateTime(time) {
        const timeElement = document.getElementById('remaining-time');
        timeElement.textContent = time;
        
        if (time <= 10) {
            timeElement.classList.add('warning');
        } else {
            timeElement.classList.remove('warning');
        }
    }

    // 渲染棋盘
    renderBoard(board) {
        this.board = board;
        
        // 计算棋盘大小
        this.calculateBoardSize();
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制所有方块
        for (let i = 0; i < board.rows; i++) {
            for (let j = 0; j < board.cols; j++) {
                const tile = board.getTile(i, j);
                if (tile && !tile.isRemoved()) {
                    this.drawTile(tile);
                }
            }
        }
    }

    // 计算棋盘大小
    calculateBoardSize() {
        const maxWidth = 600;
        const maxHeight = 600;
        
        // 根据棋盘规格计算方块大小
        const widthPerTile = maxWidth / this.board.cols;
        const heightPerTile = maxHeight / this.board.rows;
        this.tileSize = Math.floor(Math.min(widthPerTile, heightPerTile)) - this.padding * 2;
        
        // 设置画布大小
        this.canvas.width = this.board.cols * (this.tileSize + this.padding * 2);
        this.canvas.height = this.board.rows * (this.tileSize + this.padding * 2);
    }

    // 绘制单个方块
    drawTile(tile) {
        const x = tile.col * (this.tileSize + this.padding * 2) + this.padding;
        const y = tile.row * (this.tileSize + this.padding * 2) + this.padding;
        
        // 方块背景
        this.ctx.fillStyle = this.colors[tile.type % this.colors.length];
        this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
        
        // 选中状态边框
        if (tile.isSelected()) {
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(x, y, this.tileSize, this.tileSize);
        } else {
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, this.tileSize, this.tileSize);
        }
        
        // 绘制图案编号
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `bold ${this.tileSize / 2}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            tile.type,
            x + this.tileSize / 2,
            y + this.tileSize / 2
        );
    }

    // 显示路径动画
    showPathAnimation(path, callback) {
        if (!path || path.length < 2) {
            callback();
            return;
        }

        // 绘制路径
        this.ctx.strokeStyle = '#FF4444';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        for (let i = 0; i < path.length; i++) {
            const point = path[i];
            const x = point.col * (this.tileSize + this.padding * 2) + this.padding + this.tileSize / 2;
            const y = point.row * (this.tileSize + this.padding * 2) + this.padding + this.tileSize / 2;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.stroke();
        
        // 延迟后执行回调
        setTimeout(() => {
            callback();
        }, 300);
    }

    // 获取点击位置的方块坐标
    getClickedTile(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const col = Math.floor(x / (this.tileSize + this.padding * 2));
        const row = Math.floor(y / (this.tileSize + this.padding * 2));
        
        return { row, col };
    }

    // 显示暂停弹窗
    showPauseModal() {
        document.getElementById('modal-pause').classList.remove('hidden');
    }

    // 隐藏暂停弹窗
    hidePauseModal() {
        document.getElementById('modal-pause').classList.add('hidden');
    }

    // 显示胜利弹窗
    showVictoryModal(score, timeBonus, totalScore, isLastLevel) {
        document.getElementById('victory-score').textContent = score;
        document.getElementById('victory-time-bonus').textContent = timeBonus;
        document.getElementById('victory-total-score').textContent = totalScore;
        
        const nextBtn = document.getElementById('btn-next-level');
        if (isLastLevel) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'block';
        }
        
        document.getElementById('modal-victory').classList.remove('hidden');
    }

    // 显示失败弹窗
    showFailureModal(score) {
        document.getElementById('failure-score').textContent = score;
        document.getElementById('modal-failure').classList.remove('hidden');
    }

    // 显示通关弹窗
    showCompleteModal(totalScore) {
        document.getElementById('complete-total-score').textContent = totalScore;
        document.getElementById('modal-complete').classList.remove('hidden');
    }

    // 绑定Canvas点击事件
    bindCanvasClick(callback) {
        this.canvas.addEventListener('click', (event) => {
            const { row, col } = this.getClickedTile(event);
            callback(row, col);
        });
    }
}
