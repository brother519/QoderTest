// 连连看游戏核心逻辑

// 游戏配置
const BOARD_SIZE = 8;
const TOTAL_TILES = BOARD_SIZE * BOARD_SIZE;
const TOTAL_PAIRS = TOTAL_TILES / 2;

// 图案库 - 32种不同的emoji
const ICONS = [
    '🍎', '🍌', '🍇', '🍊', '🍓', '🍒', '🍑', '🍋',
    '🌸', '🌺', '🌻', '🌹', '🌷', '💐', '🌼', '🍀',
    '🐶', '🐱', '🐼', '🐨', '🦊', '🐰', '🐸', '🐵',
    '⭐', '🌙', '☀️', '⚡', '❄️', '🔥', '💧', '🌈'
];

// 游戏状态
const gameState = {
    board: [],              // 二维数组存储棋盘 (包含虚拟边界)
    selectedTiles: [],      // 当前选中的方块
    remainingPairs: TOTAL_PAIRS,
    startTime: null,
    timerInterval: null,
    isProcessing: false
};

// DOM 元素
let boardElement;
let timerDisplay;
let modal;
let finalTimeDisplay;

// 初始化游戏
function initGame() {
    boardElement = document.getElementById('game-board');
    timerDisplay = document.getElementById('timer-display');
    modal = document.getElementById('game-over-modal');
    finalTimeDisplay = document.getElementById('final-time');

    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('play-again-btn').addEventListener('click', restartGame);

    startNewGame();
}

// 开始新游戏
function startNewGame() {
    // 重置状态
    gameState.selectedTiles = [];
    gameState.remainingPairs = TOTAL_PAIRS;
    gameState.isProcessing = false;
    
    // 清除计时器
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // 隐藏弹窗
    modal.classList.add('hidden');
    
    // 初始化棋盘
    initBoard();
    
    // 渲染棋盘
    renderBoard();
    
    // 开始计时
    startTimer();
}

// 初始化棋盘数据
function initBoard() {
    // 创建图案数组 (每种图案2个)
    const tiles = [];
    for (let i = 0; i < TOTAL_PAIRS; i++) {
        tiles.push(ICONS[i], ICONS[i]);
    }
    
    // Fisher-Yates 洗牌
    for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    
    // 创建棋盘 (带虚拟边界: 实际 8x8 -> 逻辑 10x10)
    // 索引 0 和 9 是虚拟边界 (始终为空)
    // 索引 1-8 是实际棋盘
    gameState.board = [];
    for (let row = 0; row < BOARD_SIZE + 2; row++) {
        gameState.board[row] = [];
        for (let col = 0; col < BOARD_SIZE + 2; col++) {
            if (row === 0 || row === BOARD_SIZE + 1 || col === 0 || col === BOARD_SIZE + 1) {
                // 虚拟边界
                gameState.board[row][col] = null;
            } else {
                // 实际棋盘
                const index = (row - 1) * BOARD_SIZE + (col - 1);
                gameState.board[row][col] = tiles[index];
            }
        }
    }
}

// 渲染棋盘
function renderBoard() {
    boardElement.innerHTML = '';
    
    for (let row = 1; row <= BOARD_SIZE; row++) {
        for (let col = 1; col <= BOARD_SIZE; col++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.row = row;
            tile.dataset.col = col;
            tile.textContent = gameState.board[row][col];
            tile.addEventListener('click', () => handleTileClick(row, col, tile));
            boardElement.appendChild(tile);
        }
    }
}

// 处理方块点击
function handleTileClick(row, col, element) {
    // 防止处理中点击
    if (gameState.isProcessing) return;
    
    // 方块已消除
    if (gameState.board[row][col] === null) return;
    
    // 检查是否点击同一方块
    if (gameState.selectedTiles.length === 1) {
        const first = gameState.selectedTiles[0];
        if (first.row === row && first.col === col) {
            // 取消选中
            first.element.classList.remove('selected');
            gameState.selectedTiles = [];
            return;
        }
    }
    
    // 添加选中状态
    element.classList.add('selected');
    gameState.selectedTiles.push({ row, col, element });
    
    // 选中2个时进行配对检测
    if (gameState.selectedTiles.length === 2) {
        gameState.isProcessing = true;
        checkMatch();
    }
}

// 检测配对
function checkMatch() {
    const [tile1, tile2] = gameState.selectedTiles;
    const icon1 = gameState.board[tile1.row][tile1.col];
    const icon2 = gameState.board[tile2.row][tile2.col];
    
    // 类型相同且路径有效
    if (icon1 === icon2 && canConnect(tile1.row, tile1.col, tile2.row, tile2.col)) {
        // 配对成功
        handleMatchSuccess(tile1, tile2);
    } else {
        // 配对失败
        handleMatchFail(tile1, tile2);
    }
}

// 配对成功处理
function handleMatchSuccess(tile1, tile2) {
    tile1.element.classList.remove('selected');
    tile2.element.classList.remove('selected');
    tile1.element.classList.add('matched');
    tile2.element.classList.add('matched');
    
    setTimeout(() => {
        // 从棋盘移除
        gameState.board[tile1.row][tile1.col] = null;
        gameState.board[tile2.row][tile2.col] = null;
        tile1.element.classList.add('empty');
        tile2.element.classList.add('empty');
        
        gameState.remainingPairs--;
        gameState.selectedTiles = [];
        gameState.isProcessing = false;
        
        // 检查胜利
        if (gameState.remainingPairs === 0) {
            handleWin();
        }
    }, 400);
}

// 配对失败处理
function handleMatchFail(tile1, tile2) {
    tile1.element.classList.add('error');
    tile2.element.classList.add('error');
    
    setTimeout(() => {
        tile1.element.classList.remove('selected', 'error');
        tile2.element.classList.remove('selected', 'error');
        gameState.selectedTiles = [];
        gameState.isProcessing = false;
    }, 300);
}

// ==================== 路径检测算法 ====================

// 主连接检测函数
function canConnect(r1, c1, r2, c2) {
    // 同一位置
    if (r1 === r2 && c1 === c2) return false;
    
    // 0转：直线连接
    if (canConnectDirect(r1, c1, r2, c2)) return true;
    
    // 1转：L型连接
    if (canConnectOneCorner(r1, c1, r2, c2)) return true;
    
    // 2转：U/Z型连接
    if (canConnectTwoCorners(r1, c1, r2, c2)) return true;
    
    return false;
}

// 检测直线是否畅通 (不包含起点和终点)
function isLineClear(r1, c1, r2, c2) {
    if (r1 === r2) {
        // 水平线
        const minC = Math.min(c1, c2);
        const maxC = Math.max(c1, c2);
        for (let c = minC + 1; c < maxC; c++) {
            if (gameState.board[r1][c] !== null) return false;
        }
        return true;
    } else if (c1 === c2) {
        // 垂直线
        const minR = Math.min(r1, r2);
        const maxR = Math.max(r1, r2);
        for (let r = minR + 1; r < maxR; r++) {
            if (gameState.board[r][c1] !== null) return false;
        }
        return true;
    }
    return false;
}

// 0转：直线连接
function canConnectDirect(r1, c1, r2, c2) {
    if (r1 !== r2 && c1 !== c2) return false;
    return isLineClear(r1, c1, r2, c2);
}

// 1转：L型连接
function canConnectOneCorner(r1, c1, r2, c2) {
    // 转折点1: (r1, c2)
    if (gameState.board[r1][c2] === null) {
        if (isLineClear(r1, c1, r1, c2) && isLineClear(r1, c2, r2, c2)) {
            return true;
        }
    }
    
    // 转折点2: (r2, c1)
    if (gameState.board[r2][c1] === null) {
        if (isLineClear(r1, c1, r2, c1) && isLineClear(r2, c1, r2, c2)) {
            return true;
        }
    }
    
    return false;
}

// 2转：U/Z型连接
function canConnectTwoCorners(r1, c1, r2, c2) {
    const maxRow = BOARD_SIZE + 1;
    const maxCol = BOARD_SIZE + 1;
    
    // 尝试水平方向的中间线
    for (let r = 0; r <= maxRow; r++) {
        // 跳过起点和终点所在行 (这些情况在 1转 中已处理)
        if (r === r1 || r === r2) continue;
        
        // 两个转折点: (r, c1) 和 (r, c2)
        const corner1Empty = gameState.board[r][c1] === null;
        const corner2Empty = gameState.board[r][c2] === null;
        
        if (corner1Empty && corner2Empty) {
            // 检查三段路径
            const path1 = isLineClear(r1, c1, r, c1); // 垂直: (r1,c1) -> (r,c1)
            const path2 = isLineClear(r, c1, r, c2);  // 水平: (r,c1) -> (r,c2)
            const path3 = isLineClear(r, c2, r2, c2); // 垂直: (r,c2) -> (r2,c2)
            
            if (path1 && path2 && path3) return true;
        }
    }
    
    // 尝试垂直方向的中间线
    for (let c = 0; c <= maxCol; c++) {
        if (c === c1 || c === c2) continue;
        
        // 两个转折点: (r1, c) 和 (r2, c)
        const corner1Empty = gameState.board[r1][c] === null;
        const corner2Empty = gameState.board[r2][c] === null;
        
        if (corner1Empty && corner2Empty) {
            // 检查三段路径
            const path1 = isLineClear(r1, c1, r1, c); // 水平: (r1,c1) -> (r1,c)
            const path2 = isLineClear(r1, c, r2, c);  // 垂直: (r1,c) -> (r2,c)
            const path3 = isLineClear(r2, c, r2, c2); // 水平: (r2,c) -> (r2,c2)
            
            if (path1 && path2 && path3) return true;
        }
    }
    
    return false;
}

// ==================== 计时器功能 ====================

function startTimer() {
    gameState.startTime = Date.now();
    timerDisplay.textContent = '00:00';
    
    gameState.timerInterval = setInterval(() => {
        const elapsed = Date.now() - gameState.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        timerDisplay.textContent = 
            String(minutes).padStart(2, '0') + ':' + 
            String(seconds).padStart(2, '0');
    }, 1000);
}

// ==================== 游戏结束 ====================

function handleWin() {
    clearInterval(gameState.timerInterval);
    finalTimeDisplay.textContent = timerDisplay.textContent;
    modal.classList.remove('hidden');
}

function restartGame() {
    startNewGame();
}

// 启动游戏
document.addEventListener('DOMContentLoaded', initGame);
