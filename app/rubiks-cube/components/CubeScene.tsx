/**
 * 魔方 3D 场景组件
 *
 * 负责渲染整个 CSS 3D 魔方、处理视角拖拽以及层旋转动画。
 *
 * @module rubiks-cube/components/CubeScene
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { CubeState, Move, ViewAngles } from '../types/game';
import {
    CUBELET_OFFSET,
    PERSPECTIVE,
    ROTATION_DURATION,
} from '../constants/config';
import { computeCubeletRenderData, getLayerCubelets, getLayerRotation } from '../utils/cubeRender';
import { Cubelet } from './Cubelet';

interface CubeSceneProps {
    /** 当前魔方状态 */
    cubeState: CubeState;
    /** 当前视角 */
    viewAngles: ViewAngles;
    /** 是否正在动画 */
    isAnimating: boolean;
    /** 当前待执行的操作 */
    pendingMove: Move | null;
    /** 动画结束回调 */
    onAnimationEnd: () => void;
    /** 视角变化回调 */
    onViewChange: (angles: ViewAngles) => void;
}

/**
 * 解析操作字符串
 */
function parseMove(move: Move): { face: 'U' | 'D' | 'F' | 'B' | 'L' | 'R'; direction: 'CW' | 'CCW' } {
    const face = move.charAt(0) as 'U' | 'D' | 'F' | 'B' | 'L' | 'R';
    const direction = move.length === 2 ? 'CCW' : 'CW';
    return { face, direction };
}

/**
 * 比较两个 cubelet 位置是否相同
 */
function positionsEqual(a: [number, number, number], b: [number, number, number]): boolean {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

export function CubeScene({
    cubeState,
    viewAngles,
    isAnimating,
    pendingMove,
    onAnimationEnd,
    onViewChange,
}: CubeSceneProps) {
    const renderData = computeCubeletRenderData(cubeState);
    const animationGroupRef = useRef<HTMLDivElement>(null);

    const layerPositions = pendingMove ? getLayerCubelets(parseMove(pendingMove).face) : [];

    /**
     * 启动层旋转动画
     */
    useEffect(() => {
        if (!pendingMove) return;

        const { face, direction } = parseMove(pendingMove);
        const { axis, angle } = getLayerRotation(face, direction);
        const el = animationGroupRef.current;
        if (!el) return;

        // 先重置为 0 度（无过渡）
        el.style.transition = 'none';
        el.style.transform = `rotate${axis.toUpperCase()}(0deg)`;

        // 下一帧设置目标角度，触发 transition
        const frame = requestAnimationFrame(() => {
            el.style.transition = `transform ${ROTATION_DURATION}ms ease-out`;
            el.style.transform = `rotate${axis.toUpperCase()}(${angle}deg)`;
        });

        return () => cancelAnimationFrame(frame);
    }, [pendingMove]);

    /**
     * 监听动画结束
     */
    const handleTransitionEnd = useCallback(() => {
        onAnimationEnd();
    }, [onAnimationEnd]);

    /**
     * 视角拖拽逻辑
     */
    const dragRef = useRef({
        isDragging: false,
        startX: 0,
        startY: 0,
        startRx: 0,
        startRy: 0,
    });

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            // 只有点击空白处（非贴纸）才触发视角旋转
            const target = e.target as HTMLElement;
            if (target.dataset.face) return;

            dragRef.current = {
                isDragging: true,
                startX: e.clientX,
                startY: e.clientY,
                startRx: viewAngles.rx,
                startRy: viewAngles.ry,
            };
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        },
        [viewAngles.rx, viewAngles.ry]
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!dragRef.current.isDragging) return;

            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;

            // 水平拖动影响 ry，垂直拖动影响 rx
            onViewChange({
                rx: dragRef.current.startRx - dy * 0.5,
                ry: dragRef.current.startRy + dx * 0.5,
            });
        },
        [onViewChange]
    );

    const handlePointerUp = useCallback(
        (e: React.PointerEvent) => {
            if (!dragRef.current.isDragging) return;
            dragRef.current.isDragging = false;
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        },
        []
    );

    // 动画组中的 cubelet 数据
    const layerRenderData = renderData.filter((cubelet) =>
        layerPositions.some((pos) => positionsEqual(cubelet.position, pos as [number, number, number]))
    );

    // 场景整体尺寸：3 * CUBELET_OFFSET
    const sceneSize = CUBELET_OFFSET * 3;

    return (
        <div
            style={{
                width: sceneSize + 280,
                height: sceneSize + 280,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    width: sceneSize,
                    height: sceneSize,
                    perspective: PERSPECTIVE,
                    cursor: 'grab',
                    touchAction: 'none',
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    transform: `rotateX(${viewAngles.rx}deg) rotateY(${viewAngles.ry}deg)`,
                }}
            >
                {/* 主容器中渲染 27 个 cubelet，动画层中的隐藏 */}
                {renderData.map((cubelet) => {
                    const isInLayer = layerPositions.some((pos) =>
                        positionsEqual(cubelet.position, pos as [number, number, number])
                    );
                    return (
                        <Cubelet
                            key={cubelet.position.join(',')}
                            data={cubelet}
                            hidden={isAnimating && isInLayer}
                        />
                    );
                })}

                {/* 临时动画组：仅动画期间渲染 */}
                {isAnimating && pendingMove && (
                    <div
                        ref={animationGroupRef}
                        onTransitionEnd={handleTransitionEnd}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            transformStyle: 'preserve-3d',
                            transform: 'rotateX(0deg)',
                        }}
                    >
                        {layerRenderData.map((cubelet) => (
                            <Cubelet key={cubelet.position.join(',')} data={cubelet} />
                        ))}
                    </div>
                )}
            </div>
            </div>
        </div>
    );
}
