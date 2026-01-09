// 地图管理器
class Map {
    constructor(mapData) {
        this.cols = Constants.GRID_COLS;
        this.rows = Constants.GRID_ROWS;
        this.tiles = [];
        
        if (mapData) {
            this.loadMap(mapData);
        } else {
            this.createEmptyMap();
        }
    }
    
    /**
     * 创建空地图
     */
    createEmptyMap() {
        for (let row = 0; row < this.rows; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.tiles[row][col] = new Tile(Constants.TILE_TYPE.EMPTY);
            }
        }
    }
    
    /**
     * 加载地图数据
     */
    loadMap(mapData) {
        this.createEmptyMap();
        
        for (let row = 0; row < mapData.length && row < this.rows; row++) {
            for (let col = 0; col < mapData[row].length && col < this.cols; col++) {
                const tileType = mapData[row][col];
                this.tiles[row][col] = new Tile(tileType);
            }
        }
    }
    
    /**
     * 获取指定位置的地图块
     */
    getTile(col, row) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return null;
        }
        return this.tiles[row][col];
    }
    
    /**
     * 设置指定位置的地图块
     */
    setTile(col, row, tileType) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return;
        }
        this.tiles[row][col] = new Tile(tileType);
    }
    
    /**
     * 摧毁地图块（用于子弹击中砖墙）
     */
    destroyTile(col, row) {
        const tile = this.getTile(col, row);
        if (tile && tile.isDestructible()) {
            this.setTile(col, row, Constants.TILE_TYPE.EMPTY);
            return true;
        }
        return false;
    }
    
    /**
     * 渲染地图
     */
    render(renderer) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const tile = this.tiles[row][col];
                
                // 只渲染非空地图块（空地和草地稍后处理）
                if (tile.type !== Constants.TILE_TYPE.EMPTY && 
                    tile.type !== Constants.TILE_TYPE.FOREST) {
                    const pixelPos = Helpers.gridToPixel(col, row);
                    renderer.drawTile(tile, pixelPos.x, pixelPos.y);
                }
            }
        }
    }
    
    /**
     * 渲染草地层（在坦克之上）
     */
    renderForest(renderer) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const tile = this.tiles[row][col];
                
                if (tile.type === Constants.TILE_TYPE.FOREST) {
                    const pixelPos = Helpers.gridToPixel(col, row);
                    renderer.drawTile(tile, pixelPos.x, pixelPos.y);
                }
            }
        }
    }
}
