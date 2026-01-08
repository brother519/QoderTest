// 游戏状态枚举
const GameState = {
    NOT_STARTED: 'not_started',
    PLAYING: 'playing',
    PAUSED: 'paused',
    VICTORY: 'victory',
    FAILURE: 'failure'
};

// 方块状态枚举
const TileState = {
    NORMAL: 'normal',
    SELECTED: 'selected',
    REMOVED: 'removed'
};

// 方块类
class Tile {
    constructor(row, col, type) {
        this.row = row;
        this.col = col;
        this.type = type;
        this.state = TileState.NORMAL;
    }

    isRemoved() {
        return this.state === TileState.REMOVED;
    }

    isSelected() {
        return this.state === TileState.SELECTED;
    }

    select() {
        this.state = TileState.SELECTED;
    }

    deselect() {
        this.state = TileState.NORMAL;
    }

    remove() {
        this.state = TileState.REMOVED;
    }
}

// 棋盘数据类
class Board {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.tiles = [];
        this.initBoard();
    }

    initBoard() {
        // 初始化二维数组
        for (let i = 0; i < this.rows; i++) {
            this.tiles[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.tiles[i][j] = null;
            }
        }
    }

    getTile(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return null;
        }
        return this.tiles[row][col];
    }

    setTile(row, col, tile) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            this.tiles[row][col] = tile;
        }
    }

    isValidPosition(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    isEmpty(row, col) {
        const tile = this.getTile(row, col);
        return tile === null || tile.isRemoved();
    }

    getAllTiles() {
        const allTiles = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.tiles[i][j] && !this.tiles[i][j].isRemoved()) {
                    allTiles.push(this.tiles[i][j]);
                }
            }
        }
        return allTiles;
    }

    isComplete() {
        return this.getAllTiles().length === 0;
    }
}

// 关卡配置类
class LevelConfig {
    constructor(levelNumber, rows, cols, tileTypes, timeLimit, targetScore = 0) {
        this.levelNumber = levelNumber;
        this.rows = rows;
        this.cols = cols;
        this.tileTypes = tileTypes;
        this.timeLimit = timeLimit;
        this.targetScore = targetScore;
    }
}

// 游戏状态数据类
class GameStateData {
    constructor() {
        this.currentLevel = 1;
        this.gameState = GameState.NOT_STARTED;
        this.currentScore = 0;
        this.remainingTime = 0;
        this.comboCount = 0;
        this.removedPairs = 0;
        this.totalScore = 0;
        this.lastRemoveTime = 0;
    }

    reset() {
        this.currentScore = 0;
        this.comboCount = 0;
        this.removedPairs = 0;
        this.lastRemoveTime = 0;
    }

    resetForNewLevel() {
        this.currentScore = 0;
        this.comboCount = 0;
        this.removedPairs = 0;
        this.lastRemoveTime = 0;
    }
}
