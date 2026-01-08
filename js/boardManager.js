// 棋盘管理器
class BoardManager {
    constructor() {
        this.board = null;
        this.pathAlgorithm = null;
        this.selectedTile = null;
    }

    // 初始化棋盘
    initBoard(levelConfig) {
        this.board = new Board(levelConfig.rows, levelConfig.cols);
        this.pathAlgorithm = new PathAlgorithm(this.board);
        this.selectedTile = null;
        
        // 生成并填充方块
        this.generateTiles(levelConfig);
    }

    // 生成方块
    generateTiles(levelConfig) {
        const totalCells = levelConfig.rows * levelConfig.cols;
        const tileTypes = levelConfig.tileTypes;
        
        // 计算每种图案的对数
        const pairsPerType = Math.floor(totalCells / (tileTypes * 2));
        const tiles = [];

        // 生成成对的方块
        for (let type = 0; type < tileTypes; type++) {
            for (let i = 0; i < pairsPerType; i++) {
                tiles.push(type);
                tiles.push(type);
            }
        }

        // 如果还有剩余空间,填充更多对
        while (tiles.length < totalCells) {
            const type = Math.floor(Math.random() * tileTypes);
            tiles.push(type);
            tiles.push(type);
        }

        // 打乱方块顺序
        this.shuffleArray(tiles);

        // 将方块放置到棋盘上
        let index = 0;
        for (let i = 0; i < levelConfig.rows; i++) {
            for (let j = 0; j < levelConfig.cols; j++) {
                if (index < tiles.length) {
                    const tile = new Tile(i, j, tiles[index]);
                    this.board.setTile(i, j, tile);
                    index++;
                }
            }
        }
    }

    // 洗牌算法
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // 选择方块
    selectTile(row, col) {
        const tile = this.board.getTile(row, col);
        
        if (!tile || tile.isRemoved()) {
            return null;
        }

        // 如果没有已选中的方块
        if (!this.selectedTile) {
            tile.select();
            this.selectedTile = tile;
            return { action: 'select', tile: tile };
        }

        // 如果点击同一个方块,取消选中
        if (this.selectedTile === tile) {
            tile.deselect();
            this.selectedTile = null;
            return { action: 'deselect', tile: tile };
        }

        // 检查是否可以消除
        const canConnect = this.pathAlgorithm.canConnect(this.selectedTile, tile);
        
        if (canConnect) {
            // 可以消除
            const path = this.pathAlgorithm.getPathForAnimation(this.selectedTile, tile);
            const firstTile = this.selectedTile;
            const secondTile = tile;
            
            this.selectedTile = null;
            
            return { 
                action: 'match', 
                tiles: [firstTile, secondTile],
                path: path
            };
        } else {
            // 不能消除,切换选中
            this.selectedTile.deselect();
            tile.select();
            this.selectedTile = tile;
            return { action: 'switch', tile: tile };
        }
    }

    // 执行消除
    removeTiles(tiles) {
        tiles.forEach(tile => tile.remove());
    }

    // 取消选中
    deselectAll() {
        if (this.selectedTile) {
            this.selectedTile.deselect();
            this.selectedTile = null;
        }
    }

    // 检查是否完成
    isComplete() {
        return this.board.isComplete();
    }

    // 获取棋盘
    getBoard() {
        return this.board;
    }

    // 获取所有活动方块
    getActiveTiles() {
        return this.board.getAllTiles();
    }
}
