// 常量定义
const BOARD_SIZE = 15;
const CELL_SIZE = 40;
const PADDING = 30;
const CANVAS_SIZE = 600;
const PIECE_RADIUS = 18;
const PLAYER_BLACK = 1;
const PLAYER_WHITE = 2;

// GameBoard 类 - 棋盘数据模型
class GameBoard {
    constructor() {
        this.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    }

    placePiece(row, col, player) {
        if (this.isValidMove(row, col)) {
            this.board[row][col] = player;
            return true;
        }
        return false;
    }

    isValidMove(row, col) {
        if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
            return false;
        }
        return this.board[row][col] === 0;
    }

    checkWin(row, col, player) {
        const directions = [
            [[0, 1], [0, -1]],   // 水平
            [[1, 0], [-1, 0]],   // 垂直
            [[1, 1], [-1, -1]],  // 左斜
            [[1, -1], [-1, 1]]   // 右斜
        ];

        for (let directionPair of directions) {
            let count = 1; // 包含当前落子
            
            // 检查两个方向
            for (let direction of directionPair) {
                let [dr, dc] = direction;
                let r = row + dr;
                let c = col + dc;
                
                while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && 
                       this.board[r][c] === player) {
                    count++;
                    r += dr;
                    c += dc;
                }
            }
            
            if (count >= 5) {
                return true;
            }
        }
        
        return false;
    }

    reset() {
        this.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    }
}

// Renderer 类 - UI 渲染器
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    drawBoard() {
        // 绘制背景
        this.ctx.fillStyle = '#EAB676';
        this.ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // 绘制网格线
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 1;

        for (let i = 0; i < BOARD_SIZE; i++) {
            // 垂直线
            this.ctx.beginPath();
            this.ctx.moveTo(PADDING + i * CELL_SIZE, PADDING);
            this.ctx.lineTo(PADDING + i * CELL_SIZE, CANVAS_SIZE - PADDING);
            this.ctx.stroke();

            // 水平线
            this.ctx.beginPath();
            this.ctx.moveTo(PADDING, PADDING + i * CELL_SIZE);
            this.ctx.lineTo(CANVAS_SIZE - PADDING, PADDING + i * CELL_SIZE);
            this.ctx.stroke();
        }

        // 绘制星位（天元和四个星）
        const starPoints = [
            [3, 3], [3, 11], [7, 7], [11, 3], [11, 11]
        ];
        
        this.ctx.fillStyle = '#8B4513';
        starPoints.forEach(([row, col]) => {
            const x = PADDING + col * CELL_SIZE;
            const y = PADDING + row * CELL_SIZE;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
            this.ctx.fill();
        });
    }

    drawPiece(row, col, player) {
        const x = PADDING + col * CELL_SIZE;
        const y = PADDING + row * CELL_SIZE;

        this.ctx.beginPath();
        this.ctx.arc(x, y, PIECE_RADIUS, 0, 2 * Math.PI);

        if (player === PLAYER_BLACK) {
            // 黑棋 - 带渐变效果
            const gradient = this.ctx.createRadialGradient(x - 5, y - 5, 2, x, y, PIECE_RADIUS);
            gradient.addColorStop(0, '#666');
            gradient.addColorStop(1, '#000');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        } else {
            // 白棋 - 白色带黑色描边
            const gradient = this.ctx.createRadialGradient(x - 5, y - 5, 2, x, y, PIECE_RADIUS);
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#eee');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }

    drawLastMoveMarker(row, col) {
        const x = PADDING + col * CELL_SIZE;
        const y = PADDING + row * CELL_SIZE;

        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, PIECE_RADIUS / 2, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    clear() {
        this.ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
}

// GomokuGame 类 - 主控制器
class GomokuGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.statusElement = document.getElementById('status');
        this.currentPlayerElement = document.getElementById('current-player');
        
        this.board = new GameBoard();
        this.renderer = new Renderer(this.canvas);
        
        this.currentPlayer = PLAYER_BLACK;
        this.gameOver = false;
        this.lastMove = null;
        
        this.init();
    }

    init() {
        this.renderer.drawBoard();
        this.updateStatusDisplay();
        
        // 绑定事件
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
    }

    handleCanvasClick(event) {
        if (this.gameOver) {
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const [row, col] = this.pixelToGrid(x, y);

        if (row !== -1 && col !== -1) {
            this.makeMove(row, col);
        }
    }

    pixelToGrid(x, y) {
        const col = Math.round((x - PADDING) / CELL_SIZE);
        const row = Math.round((y - PADDING) / CELL_SIZE);

        if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
            return [row, col];
        }
        
        return [-1, -1];
    }

    makeMove(row, col) {
        if (!this.board.placePiece(row, col, this.currentPlayer)) {
            return;
        }

        // 绘制新棋子
        this.renderer.drawPiece(row, col, this.currentPlayer);

        // 绘制最后落子标记
        if (this.lastMove) {
            this.renderer.drawPiece(this.lastMove.row, this.lastMove.col, this.lastMove.player);
        }
        this.renderer.drawLastMoveMarker(row, col);
        this.lastMove = { row, col, player: this.currentPlayer };

        // 检查胜负
        if (this.board.checkWin(row, col, this.currentPlayer)) {
            this.endGame(this.currentPlayer);
            return;
        }

        // 切换玩家
        this.switchPlayer();
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
        this.updateStatusDisplay();
    }

    endGame(winner) {
        this.gameOver = true;
        const winnerText = winner === PLAYER_BLACK ? '黑棋' : '白棋';
        this.statusElement.innerHTML = `<span class="winner-message">🎉 ${winnerText}获胜！🎉</span>`;
        this.currentPlayerElement.style.display = 'none';
    }

    updateStatusDisplay() {
        if (!this.gameOver) {
            const playerText = this.currentPlayer === PLAYER_BLACK ? '黑棋' : '白棋';
            const playerClass = this.currentPlayer === PLAYER_BLACK ? 'player-black' : 'player-white';
            this.currentPlayerElement.textContent = playerText;
            this.currentPlayerElement.className = playerClass;
        }
    }

    restart() {
        this.board.reset();
        this.currentPlayer = PLAYER_BLACK;
        this.gameOver = false;
        this.lastMove = null;
        
        this.renderer.clear();
        this.renderer.drawBoard();
        
        this.statusElement.innerHTML = '当前玩家: <span id="current-player" class="player-black">黑棋</span>';
        this.currentPlayerElement = document.getElementById('current-player');
        this.updateStatusDisplay();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new GomokuGame();
});
