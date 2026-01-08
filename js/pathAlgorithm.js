// 路径搜索算法引擎 - 使用BFS算法
class PathAlgorithm {
    constructor(board) {
        this.board = board;
    }

    // 判断两个方块是否可以连接
    canConnect(tile1, tile2) {
        if (!tile1 || !tile2) return false;
        if (tile1.isRemoved() || tile2.isRemoved()) return false;
        if (tile1.type !== tile2.type) return false;
        if (tile1.row === tile2.row && tile1.col === tile2.col) return false;

        const path = this.findPath(tile1, tile2);
        return path !== null;
    }

    // 查找连接路径
    findPath(tile1, tile2) {
        const start = { row: tile1.row, col: tile1.col };
        const end = { row: tile2.row, col: tile2.col };

        // BFS搜索
        const queue = [];
        const visited = new Map();
        
        // 初始节点:位置、方向、转折次数、路径
        queue.push({
            row: start.row,
            col: start.col,
            direction: null,
            turns: 0,
            path: [{ row: start.row, col: start.col }]
        });
        
        visited.set(`${start.row},${start.col},null`, true);

        // 四个方向:上、右、下、左
        const directions = [
            { dr: -1, dc: 0, name: 'up' },
            { dr: 0, dc: 1, name: 'right' },
            { dr: 1, dc: 0, name: 'down' },
            { dr: 0, dc: -1, name: 'left' }
        ];

        while (queue.length > 0) {
            const current = queue.shift();

            // 找到终点
            if (current.row === end.row && current.col === end.col) {
                return current.path;
            }

            // 转折次数超过2次,跳过
            if (current.turns > 2) {
                continue;
            }

            // 扩展四个方向
            for (const dir of directions) {
                // 沿当前方向延伸,直到遇到障碍或边界
                let newRow = current.row;
                let newCol = current.col;

                while (true) {
                    newRow += dir.dr;
                    newCol += dir.dc;

                    // 检查是否超出虚拟边界(棋盘边界外一格)
                    if (newRow < -1 || newRow > this.board.rows || 
                        newCol < -1 || newCol > this.board.cols) {
                        break;
                    }

                    // 检查是否到达终点
                    if (newRow === end.row && newCol === end.col) {
                        const newPath = [...current.path, { row: newRow, col: newCol }];
                        return newPath;
                    }

                    // 检查当前位置是否为空(或边界外)
                    const isOutside = newRow < 0 || newRow >= this.board.rows || 
                                     newCol < 0 || newCol >= this.board.cols;
                    const isEmpty = isOutside || this.board.isEmpty(newRow, newCol);

                    if (!isEmpty) {
                        // 遇到障碍,停止延伸
                        break;
                    }

                    // 计算转折次数
                    let newTurns = current.turns;
                    if (current.direction !== null && current.direction !== dir.name) {
                        newTurns++;
                    }

                    // 转折次数不能超过2
                    if (newTurns > 2) {
                        break;
                    }

                    // 生成访问键
                    const key = `${newRow},${newCol},${dir.name}`;
                    if (!visited.has(key)) {
                        visited.set(key, true);
                        
                        const newPath = [...current.path, { row: newRow, col: newCol }];
                        queue.push({
                            row: newRow,
                            col: newCol,
                            direction: dir.name,
                            turns: newTurns,
                            path: newPath
                        });
                    }
                }
            }
        }

        return null; // 无路径
    }

    // 获取路径用于动画显示
    getPathForAnimation(tile1, tile2) {
        return this.findPath(tile1, tile2);
    }
}
