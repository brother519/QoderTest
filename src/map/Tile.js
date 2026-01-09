// 地图块类
class Tile {
    constructor(type) {
        this.type = type;
        this.size = Constants.TILE_SIZE;
        this.isSolid = this.checkSolid();
    }
    
    /**
     * 检查地图块是否为固体（阻挡坦克）
     */
    checkSolid() {
        return this.type === Constants.TILE_TYPE.BRICK ||
               this.type === Constants.TILE_TYPE.STEEL ||
               this.type === Constants.TILE_TYPE.WATER;
    }
    
    /**
     * 检查子弹是否可以穿过
     */
    canBulletPass() {
        return this.type === Constants.TILE_TYPE.EMPTY ||
               this.type === Constants.TILE_TYPE.FOREST ||
               this.type === Constants.TILE_TYPE.WATER;
    }
    
    /**
     * 检查地图块是否可被摧毁
     */
    isDestructible() {
        return this.type === Constants.TILE_TYPE.BRICK;
    }
}
