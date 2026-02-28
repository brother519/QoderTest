import { TILE_TYPE, GAME_CONFIG } from '../utils/Constants.js';

// 地图管理器
export class Map {
    constructor(mapData) {
        this.data = mapData;
        this.width = mapData[0].length;
        this.height = mapData.length;
    }

    // 获取指定位置的地块类型
    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return TILE_TYPE.STEEL; // 边界外视为钢墙
        }
        return this.data[y][x];
    }

    // 设置指定位置的地块类型
    setTile(x, y, type) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.data[y][x] = type;
        }
    }

    // 破坏地块
    destroyTile(x, y) {
        const tile = this.getTile(x, y);
        if (tile === TILE_TYPE.BRICK) {
            this.setTile(x, y, TILE_TYPE.EMPTY);
            return true;
        }
        return false;
    }

    // 检查位置是否可通行
    isPassable(x, y) {
        const tile = this.getTile(x, y);
        return tile === TILE_TYPE.EMPTY ||
               tile === TILE_TYPE.GRASS ||
               tile === TILE_TYPE.ICE;
    }

    // 检查位置是否阻挡子弹
    blocksBullet(x, y) {
        const tile = this.getTile(x, y);
        return tile === TILE_TYPE.BRICK ||
               tile === TILE_TYPE.STEEL ||
               tile === TILE_TYPE.BASE;
    }
}
