/**
 * 路径搜索算法引擎
 * 使用BFS（广度优先搜索）算法实现连连看游戏的路径寻找
 * 规则：最多两个转角，路径上不能有障碍物
 */
class PathAlgorithm {
    /**
     * 构造路径算法实例
     * @param {Board} board - 棋盘对象
     */
    constructor(board) {
        this.board = board;  // 保存棋盘引用
    }

    /**
     * 判断两个方块是否可以连接
     * @param {Tile} tile1 - 第一个方块
     * @param {Tile} tile2 - 第二个方块
     * @returns {boolean} 可以连接返回true，否则返回false
     */
    canConnect(tile1, tile2) {
        // 基本验证
        if (!tile1 || !tile2) return false;                  // 方块不存在
        if (tile1.isRemoved() || tile2.isRemoved()) return false;  // 方块已消除
        if (tile1.type !== tile2.type) return false;         // 类型不同
        if (tile1.row === tile2.row && tile1.col === tile2.col) return false;  // 同一个方块

        const path = this.findPath(tile1, tile2);  // 尝试找到连接路径
        return path !== null;  // 有路径则可以连接
    }

    /**
     * 查找连接路径
     * 使用BFS算法搜索，最多允许2次转角
     * @param {Tile} tile1 - 起点方块
     * @param {Tile} tile2 - 终点方块
     * @returns {Array|null} 返回路径点数组，找不到返回null
     */
    findPath(tile1, tile2) {
        const start = { row: tile1.row, col: tile1.col };  // 起点坐标
        const end = { row: tile2.row, col: tile2.col };    // 终点坐标

        // BFS搜索初始化
        const queue = [];        // 队列，存储待搜索的节点
        const visited = new Map();  // 记录已访问节点
        
        // 初始节点：位置、方向、转折次数、路径
        queue.push({
            row: start.row,
            col: start.col,
            direction: null,   // 初始无方向
            turns: 0,          // 转折次数为0
            path: [{ row: start.row, col: start.col }]  // 路径包含起点
        });
        
        visited.set(`${start.row},${start.col},null`, true);  // 标记起点已访问

        // 四个方向：上、右、下、左
        const directions = [
            { dr: -1, dc: 0, name: 'up' },      // 上
            { dr: 0, dc: 1, name: 'right' },    // 右
            { dr: 1, dc: 0, name: 'down' },     // 下
            { dr: 0, dc: -1, name: 'left' }     // 左
        ];

        // BFS主循环
        while (queue.length > 0) {
            const current = queue.shift();  // 取出队列首个节点

            // 找到终点，返回路径
            if (current.row === end.row && current.col === end.col) {
                return current.path;
            }

            // 转折次数超过2次，跳过（连连看规则）
            if (current.turns > 2) {
                continue;
            }

            // 扩展四个方向
            for (const dir of directions) {
                // 沿当前方向延伸，直到遇到障碍或边界
                let newRow = current.row;
                let newCol = current.col;

                while (true) {
                    newRow += dir.dr;  // 沿方向移动行
                    newCol += dir.dc;  // 沿方向移动列

                    // 检查是否超出虚拟边界（棋盘边界外一格）
                    if (newRow < -1 || newRow > this.board.rows || 
                        newCol < -1 || newCol > this.board.cols) {
                        break;  // 超出范围，停止延伸
                    }

                    // 检查是否到达终点
                    if (newRow === end.row && newCol === end.col) {
                        const newPath = [...current.path, { row: newRow, col: newCol }];
                        return newPath;  // 找到路径，直接返回
                    }

                    // 检查当前位置是否为空（或边界外）
                    const isOutside = newRow < 0 || newRow >= this.board.rows || 
                                     newCol < 0 || newCol >= this.board.cols;
                    const isEmpty = isOutside || this.board.isEmpty(newRow, newCol);

                    if (!isEmpty) {
                        // 遇到障碍，停止延伸
                        break;
                    }

                    // 计算转折次数
                    let newTurns = current.turns;
                    if (current.direction !== null && current.direction !== dir.name) {
                        newTurns++;  // 方向改变，转折次数+1
                    }

                    // 转折次数不能超过2
                    if (newTurns > 2) {
                        break;  // 超过限制，停止延伸
                    }

                    // 生成访问键（位置+方向）
                    const key = `${newRow},${newCol},${dir.name}`;
                    if (!visited.has(key)) {
                        visited.set(key, true);  // 标记为已访问
                        
                        const newPath = [...current.path, { row: newRow, col: newCol }];
                        queue.push({
                            row: newRow,
                            col: newCol,
                            direction: dir.name,  // 记录当前方向
                            turns: newTurns,      // 记录转折次数
                            path: newPath         // 记录路径
                        });
                    }
                }
            }
        }

        return null; // 无法找到路径
    }

    /**
     * 获取路径用于动画显示
     * @param {Tile} tile1 - 第一个方块
     * @param {Tile} tile2 - 第二个方块
     * @returns {Array|null} 返回路径点数组
     */
    getPathForAnimation(tile1, tile2) {
        return this.findPath(tile1, tile2);
    }
}
