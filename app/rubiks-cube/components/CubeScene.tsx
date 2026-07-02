/**
 * 魔方 3D 场景组件
 *
 * 负责渲染整个 CSS 3D 魔方、处理视角拖拽以及层旋转动画。
 *
 * @module rubiks-cube/components/CubeScene
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { CubeState, Move, MoveKey, ViewAngles } from '../types/game';
import {
    CUBELET_OFFSET,
    CUBELET_HALF_SIZE,
    DRAG_SENSITIVITY,
    PERSPECTIVE,
    ROTATION_DURATION,
    SCENE_PADDING,
} from '../constants/config';
import { computeCubeletRenderData, getLayerCubelets, getLayerRotation } from '../utils/cubeRender';
import { Cubelet } from './Cubelet';
import { RotationArrows } from './RotationArrows';
import { applyScreenRotation, matrixToCSS } from '../utils/viewMatrix';

interface CubeSceneProps {
    /** 当前魔方状态 */
    cubeState: CubeState;
    /** 当前视角 */
    viewAngles: ViewAngles;
    /** 是否正在动画 */
    isAnimating: boolean;
    /** 当前待执行的操作 */
    pendingMove: Move | null;
    /** 当前 hover 的操作（用于预览高亮） */
    hoveredMove?: Move | null;
    /** 动画结束回调 */
    onAnimationEnd: () => void;
    /** 视角变化回调 */
    onViewChange: (angles: ViewAngles) => void;
}

/**
 * 解析操作字符串
 */
function parseMove(move: Move): { face: MoveKey; direction: 'CW' | 'CCW' } {
    const face = move.charAt(0) as MoveKey;
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
    hoveredMove,
    onAnimationEnd,
    onViewChange,
}: CubeSceneProps) {
    const renderData = computeCubeletRenderData(cubeState);
    const animationGroupRef = useRef<HTMLDivElement>(null);

    const layerPositions = pendingMove ? getLayerCubelets(parseMove(pendingMove).face) : [];
    const hoveredLayerPositions = hoveredMove ? getLayerCubelets(parseMove(hoveredMove).face) : [];



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
        // Force reflow so the reset is applied before starting the next transition.
        void el.offsetHeight;

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
     * Trackball drag logic — uses incremental rotation to avoid gimbal lock.
     */
    const dragRef = useRef({
        isDragging: false,
        lastX: 0,
        lastY: 0,
        startMatrix: viewAngles.matrix,
    });

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            // Clicking anywhere on the scene starts view rotation drag.
            dragRef.current = {
                isDragging: true,
                lastX: e.clientX,
                lastY: e.clientY,
                startMatrix: viewAngles.matrix,
            };
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        },
        [viewAngles.matrix]
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!dragRef.current.isDragging) return;

            const dx = e.clientX - dragRef.current.lastX;
            const dy = e.clientY - dragRef.current.lastY;
            dragRef.current.lastX = e.clientX;
            dragRef.current.lastY = e.clientY;

            const deltaRx = -dy * DRAG_SENSITIVITY;
            const deltaRy = dx * DRAG_SENSITIVITY;

            // Pre-multiply incremental rotation onto the current matrix.
            dragRef.current.startMatrix = applyScreenRotation(
                dragRef.current.startMatrix,
                deltaRx,
                deltaRy
            );
            onViewChange({ matrix: dragRef.current.startMatrix });
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

    // Cube grid center offset: cubelets positioned from (0,0) need this shift to center
    const centerOffset = sceneSize / 2 - CUBELET_HALF_SIZE;

    return (
        <div
            style={{
                width: sceneSize + SCENE_PADDING,
                height: sceneSize + SCENE_PADDING,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
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
                    width: sceneSize,
                    height: sceneSize,
                    perspective: PERSPECTIVE,
                }}
            >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    transformOrigin: `${CUBELET_HALF_SIZE}px ${CUBELET_HALF_SIZE}px ${CUBELET_HALF_SIZE}px`,
                    transform: `translate(${centerOffset}px, ${centerOffset}px) ${matrixToCSS(viewAngles.matrix)}`,
                }}
            >
                {/* 主容器中渲染 27 个 cubelet，动画层中的隐藏 */}
                {renderData.map((cubelet) => {
                    const isInLayer = layerPositions.some((pos) =>
                        positionsEqual(cubelet.position, pos as [number, number, number])
                    );
                    const isHovered = hoveredLayerPositions.some((pos) =>
                        positionsEqual(cubelet.position, pos as [number, number, number])
                    );
                    return (
                        <Cubelet
                            key={cubelet.position.join(',')}
                            data={cubelet}
                            hidden={isAnimating && isInLayer}
                            highlight={isHovered}
                        />
                    );
                })}

                {/* Animation group: rendered only during layer rotation */}
                {isAnimating && pendingMove && (
                    <div
                        ref={animationGroupRef}
                        onTransitionEnd={handleTransitionEnd}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            transformStyle: 'preserve-3d',
                            transformOrigin: '0px 0px 0px',
                            transform: 'rotateX(0deg)',
                        }}
                    >
                        {layerRenderData.map((cubelet) => (
                            <Cubelet key={cubelet.position.join(',')} data={cubelet} />
                        ))}
                    </div>
                )}

                {/* Hover 旋转方向箭头 */}
                <RotationArrows move={hoveredMove} />

            </div>
            </div>
        </div>
    );
}
