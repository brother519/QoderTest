/**
 * Light-bot 引擎
 *
 * 纯函数实现，不依赖 React，便于 Jest 单测。
 *
 * @module light-bot/engine/engine
 */

import { Command, EngineState, Level, Pos } from '../types/game';

/** 把坐标编码成字符串键，便于集合查找 */
export const posKey = (p: Pos): string => `${p.row},${p.col}`;

const DIR_DELTA: Record<Exclude<Command, 'light'>, Pos> = {
    up: { row: -1, col: 0 },
    down: { row: 1, col: 0 },
    left: { row: 0, col: -1 },
    right: { row: 0, col: 1 },
};

/** 根据关卡构造初始引擎状态 */
export function createInitialState(level: Level): EngineState {
    return {
        robot: { ...level.start },
        litLamps: [],
        status: 'running',
    };
}

function isWall(pos: Pos, level: Level): boolean {
    return level.walls.some((w) => w.row === pos.row && w.col === pos.col);
}

function isLamp(pos: Pos, level: Level): boolean {
    return level.lamps.some((l) => l.row === pos.row && l.col === pos.col);
}

function inBounds(pos: Pos, size: number): boolean {
    return pos.row >= 0 && pos.row < size && pos.col >= 0 && pos.col < size;
}

/**
 * 执行一条命令并返回新状态；若命令非法（撞墙/越界）返回 null。
 * 调用方需将 null 视为 fail 终态。
 */
export function executeStep(
    state: EngineState,
    command: Command,
    level: Level,
): EngineState | null {
    if (command === 'light') {
        const key = posKey(state.robot);
        if (!isLamp(state.robot, level)) {
            return { ...state };
        }
        if (state.litLamps.includes(key)) {
            return { ...state };
        }
        return { ...state, litLamps: [...state.litLamps, key] };
    }

    const delta = DIR_DELTA[command];
    const next: Pos = {
        row: state.robot.row + delta.row,
        col: state.robot.col + delta.col,
    };

    if (!inBounds(next, level.size) || isWall(next, level)) {
        return null;
    }

    return { ...state, robot: next };
}

/** 灯是否全亮 */
export function isWin(state: EngineState, level: Level): boolean {
    return level.lamps.every((lamp) =>
        state.litLamps.includes(posKey(lamp)),
    );
}
