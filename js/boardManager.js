/**
 * 棋盘管理器
 * 负责管理游戏棋盘的创建、方块生成、选择和消除逻辑
 */
class BoardManager {
    /**
     * 构造棋盘管理器
     */
    constructor() {
        this.board = null;           // 棋盘对象
        this.pathAlgorithm = null;   // 路径搜索算法对象
        this.selectedTile = null;    // 当前选中的方块
    }

    /**
     * 初始化棋盘
     * 根据关卡配置创建棋盘并生成方块
     * @param {LevelConfig} levelConfig - 关卡配置对象
     */
    initBoard(levelConfig) {
        // 创建棋盘对象
        this.board = new Board(levelConfig.rows, levelConfig.cols);
        // 创建路径搜索算法实例
        this.pathAlgorithm = new PathAlgorithm(this.board);
        // 清空当前选中
        this.selectedTile = null;
        
        // 生成并填充方块
        this.generateTiles(levelConfig);
    }

    /**
     * 生成方块
     * 根据关卡配置生成成对的方块并随机分布到棋盘上
     * @param {LevelConfig} levelConfig - 关卡配置对象
     */
    generateTiles(levelConfig) {
        const totalCells = levelConfig.rows * levelConfig.cols;  // 计算总格子数
        const tileTypes = levelConfig.tileTypes;                 // 图案种类数
        
        // 计算每种图案的对数
        const pairsPerType = Math.floor(totalCells / (tileTypes * 2));
        const tiles = [];  // 方块类型数组

        // 生成成对的方块
        for (let type = 0; type < tileTypes; type++) {
            for (let i = 0; i < pairsPerType; i++) {
                tiles.push(type);  // 添加一对相同类型的方块
                tiles.push(type);
            }
        }

        // 如果还有剩余空间,填充更多对
        while (tiles.length < totalCells) {
            const type = Math.floor(Math.random() * tileTypes);  // 随机选择一种类型
            tiles.push(type);  // 添加一对
            tiles.push(type);
        }

        // 打乱方块顺序
        this.shuffleArray(tiles);

        // 将方块放置到棋盘上
        let index = 0;
        for (let i = 0; i < levelConfig.rows; i++) {
            for (let j = 0; j < levelConfig.cols; j++) {
                if (index < tiles.length) {
                    const tile = new Tile(i, j, tiles[index]);  // 创建方块对象
                    this.board.setTile(i, j, tile);             // 设置到棋盘上
                    index++;
                }
            }
        }
    }

    /**
     * 洗牌算法（Fisher-Yates算法）
     * 随机打乱数组元素顺序
     * @param {Array} array - 要打乱的数组
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));  // 随机选择一个索引
            [array[i], array[j]] = [array[j], array[i]];    // 交换元素
        }
    }

    /**
     * 选择方块
     * 处理玩家点击方块的逻辑，包括选中、取消选中、切换选中和匹配消除
     * @param {number} row - 被点击方块的行索引
     * @param {number} col - 被点击方块的列索引
     * @returns {Object|null} 返回操作结果对象，包含 action 和相关数据
     */
    selectTile(row, col) {
        const tile = this.board.getTile(row, col);
        
        // 如果方块不存在或已被消除，忽略
        if (!tile || tile.isRemoved()) {
            return null;
        }

        // 如果没有已选中的方块，则选中当前方块
        if (!this.selectedTile) {
            tile.select();                              // 标记为选中状态
            this.selectedTile = tile;                   // 保存选中的方块
            return { action: 'select', tile: tile };    // 返回选中操作
        }

        // 如果点击同一个方块,取消选中
        if (this.selectedTile === tile) {
            tile.deselect();                              // 取消选中状态
            this.selectedTile = null;                     // 清空选中记录
            return { action: 'deselect', tile: tile };    // 返回取消选中操作
        }

        // 检查是否可以消除
        const canConnect = this.pathAlgorithm.canConnect(this.selectedTile, tile);
        
        if (canConnect) {
            // 可以消除，获取连接路径用于动画
            const path = this.pathAlgorithm.getPathForAnimation(this.selectedTile, tile);
            const firstTile = this.selectedTile;   // 保存第一个方块
            const secondTile = tile;                // 保存第二个方块
            
            this.selectedTile = null;  // 清空选中状态
            
            return { 
                action: 'match',           // 匹配成功
                tiles: [firstTile, secondTile],  // 返回要消除的两个方块
                path: path                 // 返回连接路径
            };
        } else {
            // 不能消除,切换选中
            this.selectedTile.deselect();           // 取消原来的选中
            tile.select();                          // 选中新点击的方块
            this.selectedTile = tile;               // 更新选中记录
            return { action: 'switch', tile: tile };  // 返回切换操作
        }
    }

    /**
     * 执行消除
     * 将多个方块标记为已消除状态
     * @param {Tile[]} tiles - 要消除的方块数组
     */
    removeTiles(tiles) {
        tiles.forEach(tile => tile.remove());
    }

    /**
     * 取消所有选中
     * 清空当前选中的方块
     */
    deselectAll() {
        if (this.selectedTile) {
            this.selectedTile.deselect();  // 取消选中状态
            this.selectedTile = null;      // 清空选中记录
        }
    }

    /**
     * 检查是否完成
     * 判断棋盘上是否还有方块
     * @returns {boolean} 所有方块已消除返回true
     */
    isComplete() {
        return this.board.isComplete();
    }

    /**
     * 获取棋盘
     * @returns {Board} 返回棋盘对象
     */
    getBoard() {
        return this.board;
    }

    /**
     * 获取所有活动方块
     * @returns {Tile[]} 返回所有未被消除的方块数组
     */
    getActiveTiles() {
        return this.board.getAllTiles();
    }
}
