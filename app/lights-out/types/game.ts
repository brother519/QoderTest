/**
 * 点灯游戏类型定义
 *
 * @module lights-out/types/game
 */

/** 游戏状态 */
export type LightsOutStatus = Extract<import('@/lib/types/game').GameStatus, 'playing' | 'won'>;

/** 关卡数据 */
export interface LevelData {
    /** 关卡编号 */
    id: number;
    /** 关卡名称 */
    name: string;
    /** 网格尺寸 */
    size: number;
    /** 初始灯状态（true = 亮） */
    initial: boolean[][];
}
