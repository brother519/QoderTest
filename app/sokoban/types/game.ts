/**
 * 推箱子游戏类型定义
 *
 * 定义地图格子、实体、关卡数据、游戏状态等核心类型。
 *
 * @module sokoban/types/game
 */

/** 地图格子类型（静态，不会改变） */
export type CellType = 'wall' | 'floor' | 'target';

/** 移动方向 */
export type Direction = 'up' | 'down' | 'left' | 'right';

/** 游戏状态 */
export type SokobanStatus = Extract<import('@/lib/types/game').GameStatus, 'playing' | 'won'>;

/** 网格坐标 */
export interface Position {
    row: number;
    col: number;
}

/** 关卡数据（字符串地图格式） */
export interface LevelData {
    /** 关卡编号（从 1 开始） */
    id: number;
    /** 关卡名称 */
    name: string;
    /** 地图行数组，每行是一个字符串 */
    map: string[];
}

/** 一步操作的快照（用于撤销） */
export interface MoveSnapshot {
    /** 操作前玩家位置 */
    player: Position;
    /** 操作前箱子位置列表 */
    boxes: Position[];
}

/** 游戏运行状态 */
export interface GameState {
    /** 玩家当前位置 */
    player: Position;
    /** 所有箱子的位置 */
    boxes: Position[];
    /** 总移动步数 */
    moves: number;
    /** 推箱子次数 */
    pushes: number;
    /** 游戏状态 */
    status: SokobanStatus;
}

/** 解析后的关卡（供游戏逻辑使用） */
export interface ParsedLevel {
    /** 静态地图网格（墙/地板/目标） */
    grid: CellType[][];
    /** 玩家初始位置 */
    playerStart: Position;
    /** 箱子初始位置 */
    boxStarts: Position[];
    /** 目标位置列表 */
    targets: Position[];
    /** 地图行数 */
    rows: number;
    /** 地图列数 */
    cols: number;
}
