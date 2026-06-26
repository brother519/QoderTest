/**
 * 一笔画游戏类型定义
 *
 * @module one-stroke/types/game
 */

/** 图中的节点 */
export interface Node {
    id: number;
    x: number; // SVG 坐标 (0-400)
    y: number;
}

/** 图中的边 */
export interface Edge {
    id: number;
    from: number; // node id
    to: number; // node id
}

/** 关卡定义 */
export interface Level {
    id: number;
    name: string;
    nodes: Node[];
    edges: Edge[];
}

/** 游戏状态 */
export type GameStatus = 'idle' | 'playing' | 'won';

/** 已走的路径步骤 */
export interface PathStep {
    edgeId: number;
    fromNodeId: number;
    toNodeId: number;
}

/** 游戏整体状态 */
export interface GameState {
    status: GameStatus;
    currentLevel: Level;
    currentLevelIndex: number;
    unlockedLevels: number; // 解锁的关卡数量（最大index+1）
    currentNodeId: number | null; // 当前所在节点
    traversedEdgeIds: Set<number>; // 已走过的边
    path: PathStep[]; // 走过的路径步骤（用于撤销）
    showLevelSelect: boolean;
}
