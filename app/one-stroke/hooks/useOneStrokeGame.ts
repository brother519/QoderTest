/**
 * 一笔画游戏核心逻辑 Hook
 *
 * 管理游戏状态、节点点击交互、撤销/重置、关卡解锁与持久化。
 *
 * @module one-stroke/hooks/useOneStrokeGame
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { GameState, GameStatus, PathStep, Level } from '../types/game';
import { LEVELS, STORAGE_KEY } from '../constants/config';

// ─── 辅助函数 ───────────────────────────────────────────────────────────────

/** 获取与某节点直接相连的所有边（包含已走和未走） */
function getAdjacentEdges(level: Level, nodeId: number) {
    return level.edges.filter((e) => e.from === nodeId || e.to === nodeId);
}

/** 判断两个节点之间是否有未走过的边 */
function getUntraversedEdgeBetween(
    level: Level,
    traversed: Set<number>,
    fromId: number,
    toId: number
) {
    return level.edges.find(
        (e) =>
            !traversed.has(e.id) &&
            ((e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId))
    );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export interface UseOneStrokeGameReturn {
    state: GameState;
    /** 点击节点 */
    handleNodeClick: (nodeId: number) => void;
    /** 撤销上一步 */
    undo: () => void;
    /** 重置当前关卡 */
    reset: () => void;
    /** 跳转到指定关卡（需已解锁） */
    goToLevel: (index: number) => void;
    /** 切换关卡选择界面 */
    toggleLevelSelect: () => void;
    /** 下一关 */
    nextLevel: () => void;
}

function loadUnlocked(): number {
    if (typeof window === 'undefined') return 1;
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        return v ? Math.max(1, parseInt(v, 10)) : 1;
    } catch {
        return 1;
    }
}

function saveUnlocked(n: number) {
    try {
        localStorage.setItem(STORAGE_KEY, String(n));
    } catch {
        // ignore
    }
}

function buildInitialState(levelIndex: number, unlockedLevels: number): GameState {
    return {
        status: 'idle' as GameStatus,
        currentLevel: LEVELS[levelIndex],
        currentLevelIndex: levelIndex,
        unlockedLevels,
        currentNodeId: null,
        traversedEdgeIds: new Set<number>(),
        path: [],
        showLevelSelect: false,
    };
}

export function useOneStrokeGame(): UseOneStrokeGameReturn {
    const [state, setState] = useState<GameState>(() => {
        const unlocked = loadUnlocked();
        return buildInitialState(0, unlocked);
    });

    // 每次解锁新关卡时持久化
    useEffect(() => {
        saveUnlocked(state.unlockedLevels);
    }, [state.unlockedLevels]);

    /** 点击节点 */
    const handleNodeClick = useCallback((nodeId: number) => {
        setState((prev) => {
            const { status, currentLevel, currentNodeId, traversedEdgeIds, path } = prev;

            // 游戏已通关或在选关界面：忽略
            if (status === 'won' || prev.showLevelSelect) return prev;

            // 还未开始：点击任意节点作为起点，进入 playing
            if (status === 'idle' || currentNodeId === null) {
                return {
                    ...prev,
                    status: 'playing',
                    currentNodeId: nodeId,
                    traversedEdgeIds: new Set<number>(),
                    path: [],
                };
            }

            // 点击当前节点：不处理
            if (nodeId === currentNodeId) return prev;

            // 寻找当前节点到目标节点之间未走的边
            const edge = getUntraversedEdgeBetween(
                currentLevel,
                traversedEdgeIds,
                currentNodeId,
                nodeId
            );
            if (!edge) return prev; // 没有可走的边

            const newTraversed = new Set(traversedEdgeIds);
            newTraversed.add(edge.id);

            const newStep: PathStep = {
                edgeId: edge.id,
                fromNodeId: currentNodeId,
                toNodeId: nodeId,
            };
            const newPath = [...path, newStep];

            // 判断是否通关（所有边都走过）
            const won = newTraversed.size === currentLevel.edges.length;

            // 解锁下一关
            let newUnlocked = prev.unlockedLevels;
            if (won && prev.currentLevelIndex + 1 < LEVELS.length) {
                newUnlocked = Math.max(newUnlocked, prev.currentLevelIndex + 2);
            }

            return {
                ...prev,
                status: won ? 'won' : 'playing',
                currentNodeId: nodeId,
                traversedEdgeIds: newTraversed,
                path: newPath,
                unlockedLevels: newUnlocked,
            };
        });
    }, []);

    /** 撤销上一步 */
    const undo = useCallback(() => {
        setState((prev) => {
            if (prev.path.length === 0) return prev;
            if (prev.status === 'won') return prev;

            const newPath = [...prev.path];
            const lastStep = newPath.pop()!;

            const newTraversed = new Set(prev.traversedEdgeIds);
            newTraversed.delete(lastStep.edgeId);

            // 回退到上一个节点
            const prevNodeId = newPath.length > 0 ? newPath[newPath.length - 1].toNodeId : null;
            // 如果撤销到第一步，回退到起始节点（lastStep.fromNodeId）
            const backNode = newPath.length === 0 ? lastStep.fromNodeId : prevNodeId;

            return {
                ...prev,
                status: 'playing',
                currentNodeId: backNode,
                traversedEdgeIds: newTraversed,
                path: newPath,
            };
        });
    }, []);

    /** 重置当前关卡 */
    const reset = useCallback(() => {
        setState((prev) => ({
            ...prev,
            status: 'idle',
            currentNodeId: null,
            traversedEdgeIds: new Set<number>(),
            path: [],
            showLevelSelect: false,
        }));
    }, []);

    /** 跳转关卡 */
    const goToLevel = useCallback((index: number) => {
        setState((prev) => {
            if (index >= prev.unlockedLevels || index < 0) return prev;
            return {
                ...prev,
                status: 'idle',
                currentLevel: LEVELS[index],
                currentLevelIndex: index,
                currentNodeId: null,
                traversedEdgeIds: new Set<number>(),
                path: [],
                showLevelSelect: false,
            };
        });
    }, []);

    /** 切换关卡选择界面 */
    const toggleLevelSelect = useCallback(() => {
        setState((prev) => ({ ...prev, showLevelSelect: !prev.showLevelSelect }));
    }, []);

    /** 下一关 */
    const nextLevel = useCallback(() => {
        setState((prev) => {
            const nextIndex = prev.currentLevelIndex + 1;
            if (nextIndex >= LEVELS.length) return prev;
            return {
                ...prev,
                status: 'idle',
                currentLevel: LEVELS[nextIndex],
                currentLevelIndex: nextIndex,
                currentNodeId: null,
                traversedEdgeIds: new Set<number>(),
                path: [],
                showLevelSelect: false,
            };
        });
    }, []);

    // 检测死局（所有当前节点相邻边都已走完，但还有边未走 → 提示用户）
    // 这里通过 state 暴露一个 isStuck 计算属性
    const { currentNodeId, traversedEdgeIds, currentLevel, status } = state;
    const isStuck =
        status === 'playing' &&
        currentNodeId !== null &&
        traversedEdgeIds.size < currentLevel.edges.length &&
        getAdjacentEdges(currentLevel, currentNodeId).every((e) => traversedEdgeIds.has(e.id));

    return {
        state: { ...state },
        handleNodeClick,
        undo,
        reset,
        goToLevel,
        toggleLevelSelect,
        nextLevel,
        ...(isStuck ? { isStuck: true } : { isStuck: false }),
    } as UseOneStrokeGameReturn & { isStuck: boolean };
}
