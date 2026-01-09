// 基地（老鹰）
class Base extends Entity {
    constructor(x, y) {
        super(x, y, Constants.TILE_SIZE * 2); // 基地占2x2格子
        this.destroyed = false;
    }
    
    /**
     * 基地被击中
     */
    hit() {
        this.destroyed = true;
        this.active = false;
    }
    
    /**
     * 渲染基地
     */
    render(renderer) {
        renderer.drawBase(this);
    }
}
