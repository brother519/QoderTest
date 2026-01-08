/**
 * 游戏状态枚举
 * 定义游戏的五种基本状态
 */
const GameState = {
    NOT_STARTED: 'not_started',  // 未开始 - 游戏初始状态或在主菜单
    PLAYING: 'playing',          // 进行中 - 玩家正在游戏
    PAUSED: 'paused',            // 暂停 - 游戏暂停状态
    VICTORY: 'victory',          // 胜利 - 关卡通过
    FAILURE: 'failure'           // 失败 - 时间耗尽或其他失败条件
};

/**
 * 方块状态枚举
 * 定义单个方块的三种状态
 */
const TileState = {
    NORMAL: 'normal',      // 普通状态 - 方块正常显示
    SELECTED: 'selected',  // 选中状态 - 方块被玩家点击选中
    REMOVED: 'removed'     // 已消除 - 方块已被成功匹配消除
};

/**
 * 方块类
 * 表示游戏棋盘上的单个方块元素
 */
class Tile {
    /**
     * 构造方块对象
     * @param {number} row - 方块所在行索引（从0开始）
     * @param {number} col - 方块所在列索引（从0开始）
     * @param {number} type - 方块类型/图案编号
     */
    constructor(row, col, type) {
        this.row = row;                    // 行坐标
        this.col = col;                    // 列坐标
        this.type = type;                  // 图案类型
        this.state = TileState.NORMAL;     // 初始状态为普通状态
    }

    /**
     * 判断方块是否已被消除
     * @returns {boolean} 如果方块已消除返回true，否则返回false
     */
    isRemoved() {
        return this.state === TileState.REMOVED;
    }

    /**
     * 判断方块是否处于选中状态
     * @returns {boolean} 如果方块被选中返回true，否则返回false
     */
    isSelected() {
        return this.state === TileState.SELECTED;
    }

    /**
     * 选中方块
     * 将方块状态设置为选中状态
     */
    select() {
        this.state = TileState.SELECTED;
    }

    /**
     * 取消选中方块
     * 将方块状态恢复为普通状态
     */
    deselect() {
        this.state = TileState.NORMAL;
    }

    /**
     * 消除方块
     * 将方块标记为已消除状态
     */
    remove() {
        this.state = TileState.REMOVED;
    }
}

/**
 * 棋盘数据类
 * 管理整个游戏棋盘的方块数据结构
 */
class Board {
    /**
     * 构造棋盘对象
     * @param {number} rows - 棋盘行数
     * @param {number} cols - 棋盘列数
     */
    constructor(rows, cols) {
        this.rows = rows;    // 棋盘总行数
        this.cols = cols;    // 棋盘总列数
        this.tiles = [];     // 二维数组，存储所有方块
        this.initBoard();    // 初始化棋盘数据结构
    }

    /**
     * 初始化棋盘数据结构
     * 创建二维数组并填充null值
     */
    initBoard() {
        // 初始化二维数组
        for (let i = 0; i < this.rows; i++) {
            this.tiles[i] = [];  // 创建每一行
            for (let j = 0; j < this.cols; j++) {
                this.tiles[i][j] = null;  // 初始化每个位置为null
            }
        }
    }

    /**
     * 获取指定位置的方块
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {Tile|null} 返回该位置的方块对象，超出范围则返回null
     */
    getTile(row, col) {
        // 检查坐标是否在有效范围内
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return null;
        }
        return this.tiles[row][col];
    }

    /**
     * 在指定位置设置方块
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @param {Tile} tile - 要设置的方块对象
     */
    setTile(row, col, tile) {
        // 只在坐标有效时才设置方块
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            this.tiles[row][col] = tile;
        }
    }

    /**
     * 检查坐标是否有效
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {boolean} 坐标在棋盘范围内返回true，否则返回false
     */
    isValidPosition(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    /**
     * 检查指定位置是否为空
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {boolean} 位置为空或方块已消除时返回true
     */
    isEmpty(row, col) {
        const tile = this.getTile(row, col);
        return tile === null || tile.isRemoved();
    }

    /**
     * 获取棋盘上所有活动的方块
     * @returns {Tile[]} 返回所有未被消除的方块数组
     */
    getAllTiles() {
        const allTiles = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                // 只收集存在且未被消除的方块
                if (this.tiles[i][j] && !this.tiles[i][j].isRemoved()) {
                    allTiles.push(this.tiles[i][j]);
                }
            }
        }
        return allTiles;
    }

    /**
     * 检查棋盘是否已完成（所有方块都已消除）
     * @returns {boolean} 所有方块已消除返回true，否则返回false
     */
    isComplete() {
        return this.getAllTiles().length === 0;
    }
}

/**
 * 关卡配置类
 * 存储单个关卡的配置参数
 */
class LevelConfig {
    /**
     * 构造关卡配置对象
     * @param {number} levelNumber - 关卡编号
     * @param {number} rows - 棋盘行数
     * @param {number} cols - 棋盘列数
     * @param {number} tileTypes - 方块图案种类数
     * @param {number} timeLimit - 时间限制（秒）
     * @param {number} targetScore - 目标分数（默认为0，暂未使用）
     */
    constructor(levelNumber, rows, cols, tileTypes, timeLimit, targetScore = 0) {
        this.levelNumber = levelNumber;  // 关卡编号
        this.rows = rows;                // 棋盘行数
        this.cols = cols;                // 棋盘列数
        this.tileTypes = tileTypes;      // 图案种类数，影响游戏难度
        this.timeLimit = timeLimit;      // 时间限制（秒）
        this.targetScore = targetScore;  // 目标分数（预留字段）
    }
}

/**
 * 游戏状态数据类
 * 管理游戏运行时的各种状态数据
 */
class GameStateData {
    /**
     * 构造游戏状态对象
     * 初始化所有游戏状态属性
     */
    constructor() {
        this.currentLevel = 1;                     // 当前关卡编号
        this.gameState = GameState.NOT_STARTED;    // 当前游戏状态
        this.currentScore = 0;                     // 当前关卡分数
        this.remainingTime = 0;                    // 剩余时间（秒）
        this.comboCount = 0;                       // 当前连击次数
        this.removedPairs = 0;                     // 已消除的配对数
        this.totalScore = 0;                       // 累计总分数
        this.lastRemoveTime = 0;                   // 最后一次消除的时间戳
    }

    /**
     * 重置游戏状态
     * 将当前关卡相关的状态重置为初始值
     */
    reset() {
        this.currentScore = 0;     // 重置当前分数
        this.comboCount = 0;       // 重置连击数
        this.removedPairs = 0;     // 重置已消除配对数
        this.lastRemoveTime = 0;   // 重置最后消除时间
    }

    /**
     * 为新关卡重置状态
     * 功能与reset()相同，用于语义化区分
     */
    resetForNewLevel() {
        this.currentScore = 0;     // 重置当前分数
        this.comboCount = 0;       // 重置连击数
        this.removedPairs = 0;     // 重置已消除配对数
        this.lastRemoveTime = 0;   // 重置最后消除时间
    }
}
