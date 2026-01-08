/**
 * UI组件管理器
 * 负责所有用户界面的渲染和显示，包括棋盘、菜单、弹窗等
 */
class UIManager {
    /**
     * 构造UI管理器
     */
    constructor() {
        this.canvas = document.getElementById('game-board');  // 获取棋盘Canvas元素
        this.ctx = this.canvas.getContext('2d');            // 获取2D绘图上下文
        this.board = null;                                  // 当前棋盘对象
        this.tileSize = 50;                                 // 方块大小（像素）
        this.padding = 5;                                   // 方块间隔（像素）
        // 12种预定义颜色，用于不同类型的方块
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
            '#F8B4D9', '#A8E6CF', '#FFD3B6', '#FFAAA5'
        ];
    }

    /**
     * 显示主菜单
     * 隐藏所有其他界面，显示主菜单
     */
    showMainMenu() {
        this.hideAllScreens();  // 隐藏所有界面
        document.getElementById('main-menu').classList.remove('hidden');
    }

    /**
     * 显示关卡选择界面
     * 动态生成关卡按钮，未解锁的关卡为禁用状态
     * @param {number} maxUnlockedLevel - 最大解锁关卡编号
     * @param {number} totalLevels - 总关卡数
     */
    showLevelSelect(maxUnlockedLevel, totalLevels) {
        this.hideAllScreens();
        const levelSelect = document.getElementById('level-select');
        const levelList = document.getElementById('level-list');
        
        levelList.innerHTML = '';  // 清空现有按钮
        // 为每个关卡创建按钮
        for (let i = 1; i <= totalLevels; i++) {
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            btn.textContent = `关卡 ${i}`;
            btn.disabled = i > maxUnlockedLevel;  // 未解锁则禁用
            btn.onclick = () => window.game.startLevelByNumber(i);
            levelList.appendChild(btn);
        }
        
        levelSelect.classList.remove('hidden');
    }

    /**
     * 显示游戏界面
     * 隐藏所有其他界面和弹窗，显示游戏界面
     */
    showGameScreen() {
        this.hideAllScreens();
        this.hideAllModals();
        document.getElementById('game-screen').classList.remove('hidden');
    }

    /**
     * 隐藏所有界面
     * 遍历所有.screen元素并添加hidden类
     */
    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
    }

    /**
     * 隐藏所有弹窗
     * 遍历所有.modal元素并添加hidden类
     */
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    /**
     * 更新关卡信息显示
     * @param {number} level - 当前关卡编号
     */
    updateLevelInfo(level) {
        document.getElementById('current-level').textContent = level;
    }

    /**
     * 更新分数显示
     * @param {number} score - 当前分数
     */
    updateScore(score) {
        document.getElementById('current-score').textContent = score;
    }

    /**
     * 更新连击数显示
     * @param {number} combo - 当前连击数
     */
    updateCombo(combo) {
        document.getElementById('combo-count').textContent = combo;
    }

    /**
     * 更新时间显示
     * 当时间低于10秒时显示警告样式
     * @param {number} time - 剩余时间（秒）
     */
    updateTime(time) {
        const timeElement = document.getElementById('remaining-time');
        timeElement.textContent = time;
        
        // 时间低于10秒时显示警告样式
        if (time <= 10) {
            timeElement.classList.add('warning');
        } else {
            timeElement.classList.remove('warning');
        }
    }

    /**
     * 渲染棋盘
     * 清空画布并绘制所有方块
     * @param {Board} board - 棋盘对象
     */
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
                if (tile && !tile.isRemoved()) {  // 只绘制存在且未消除的方块
                    this.drawTile(tile);
                }
            }
        }
    }

    /**
     * 计算棋盘大小
     * 根据棋盘行列数动态计算方块大小和画布尺寸
     */
    calculateBoardSize() {
        const maxWidth = 600;   // 最大宽度
        const maxHeight = 600;  // 最大高度
        
        // 根据棋盘规格计算方块大小
        const widthPerTile = maxWidth / this.board.cols;
        const heightPerTile = maxHeight / this.board.rows;
        this.tileSize = Math.floor(Math.min(widthPerTile, heightPerTile)) - this.padding * 2;
        
        // 设置画布大小
        this.canvas.width = this.board.cols * (this.tileSize + this.padding * 2);
        this.canvas.height = this.board.rows * (this.tileSize + this.padding * 2);
    }

    /**
     * 绘制单个方块
     * 绘制方块背景、边框和图案编号
     * @param {Tile} tile - 要绘制的方块对象
     */
    drawTile(tile) {
        // 计算方块位置
        const x = tile.col * (this.tileSize + this.padding * 2) + this.padding;
        const y = tile.row * (this.tileSize + this.padding * 2) + this.padding;
        
        // 绘制方块背景颜色
        this.ctx.fillStyle = this.colors[tile.type % this.colors.length];
        this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
        
        // 绘制边框（选中状态不同颜色）
        if (tile.isSelected()) {
            this.ctx.strokeStyle = '#FFD700';  // 选中时金色边框
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(x, y, this.tileSize, this.tileSize);
        } else {
            this.ctx.strokeStyle = '#333';     // 普通状态黑色边框
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, this.tileSize, this.tileSize);
        }
        
        // 绘制图案编号（白色文字）
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

    /**
     * 显示路径动画
     * 在棋盘上绘制连接路径，延迟后执行回调
     * @param {Array} path - 路径点数组
     * @param {Function} callback - 动画完成后的回调函数
     */
    showPathAnimation(path, callback) {
        // 路径无效时直接执行回调
        if (!path || path.length < 2) {
            callback();
            return;
        }

        // 绘制路径线
        this.ctx.strokeStyle = '#FF4444';  // 红色路径
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        // 遍历路径点绘制连线
        for (let i = 0; i < path.length; i++) {
            const point = path[i];
            // 计算方块中心点坐标
            const x = point.col * (this.tileSize + this.padding * 2) + this.padding + this.tileSize / 2;
            const y = point.row * (this.tileSize + this.padding * 2) + this.padding + this.tileSize / 2;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);  // 移动到起点
            } else {
                this.ctx.lineTo(x, y);  // 连线到下一个点
            }
        }
        
        this.ctx.stroke();  // 绘制路径
        
        // 延迟300毫秒后执行回调（让玩家看到路径）
        setTimeout(() => {
            callback();
        }, 300);
    }

    /**
     * 获取点击位置的方块坐标
     * 将鼠标点击位置转换为棋盘行列坐标
     * @param {Event} event - 鼠标点击事件
     * @returns {Object} 包含row和col的对象
     */
    getClickedTile(event) {
        const rect = this.canvas.getBoundingClientRect();  // 获取Canvas位置
        const x = event.clientX - rect.left;  // 计算相对于Canvas的x坐标
        const y = event.clientY - rect.top;   // 计算相对于Canvas的y坐标
        
        // 转换为棋盘行列坐标
        const col = Math.floor(x / (this.tileSize + this.padding * 2));
        const row = Math.floor(y / (this.tileSize + this.padding * 2));
        
        return { row, col };
    }

    /**
     * 显示暂停弹窗
     */
    showPauseModal() {
        document.getElementById('modal-pause').classList.remove('hidden');
    }

    /**
     * 隐藏暂停弹窗
     */
    hidePauseModal() {
        document.getElementById('modal-pause').classList.add('hidden');
    }

    /**
     * 显示胜利弹窗
     * @param {number} score - 关卡分数
     * @param {number} timeBonus - 时间奖励
     * @param {number} totalScore - 总分（分数+时间奖励）
     * @param {boolean} isLastLevel - 是否为最后一关
     */
    showVictoryModal(score, timeBonus, totalScore, isLastLevel) {
        document.getElementById('victory-score').textContent = score;
        document.getElementById('victory-time-bonus').textContent = timeBonus;
        document.getElementById('victory-total-score').textContent = totalScore;
        
        // 如果是最后一关，隐藏“下一关”按钮
        const nextBtn = document.getElementById('btn-next-level');
        if (isLastLevel) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'block';
        }
        
        document.getElementById('modal-victory').classList.remove('hidden');
    }

    /**
     * 显示失败弹窗
     * @param {number} score - 当前分数
     */
    showFailureModal(score) {
        document.getElementById('failure-score').textContent = score;
        document.getElementById('modal-failure').classList.remove('hidden');
    }

    /**
     * 显示通关弹窗
     * @param {number} totalScore - 累计总分
     */
    showCompleteModal(totalScore) {
        document.getElementById('complete-total-score').textContent = totalScore;
        document.getElementById('modal-complete').classList.remove('hidden');
    }

    /**
     * 绑定Canvas点击事件
     * @param {Function} callback - 点击时的回调函数，接收(row, col)参数
     */
    bindCanvasClick(callback) {
        this.canvas.addEventListener('click', (event) => {
            const { row, col } = this.getClickedTile(event);  // 获取点击的方块坐标
            callback(row, col);  // 调用回调函数
        });
    }
}
