/**
 * Light-bot 类型定义
 *
 * @module light-bot/types/game
 */

/** 绝对方向指令 + 点灯 */
export type Command = 'up' | 'down' | 'left' | 'right' | 'light';

/** 格子类型 */
export type CellType = 'empty' | 'wall' | 'lamp';

/** 游戏状态机 */
export type LightBotStatus = 'playing' | 'running' | 'win' | 'fail';

/** 坐标 */
export interface Pos {
    row: number;
    col: number;
}

/** 关卡数据 */
export interface Level {
    id: 1 | 2 | 3;
    name: string;
    size: number;
    start: Pos;
    walls: Pos[];
    lamps: Pos[];
    solution: Command[];
}

/** 引擎运行时状态（纯数据，可被测试直接构造） */
export interface EngineState {
    robot: Pos;
    litLamps: string[]; // "row,col" 字符串集合
    status: 'running' | 'win' | 'fail';
}
