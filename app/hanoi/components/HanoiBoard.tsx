/**
 * Hanoi Tower Game Board Component
 *
 * @module hanoi/components/HanoiBoard
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';
import { PegIndex } from '../types/game';
import { HANOI_CONFIG, CANVAS } from '../constants/config';

interface HanoiBoardProps {
    pegs: number[][];
    selectedPeg: PegIndex | null;
    level: number;
    onPegClick: (pegIndex: PegIndex) => void;
    onDiskMove: (fromPeg: PegIndex, toPeg: PegIndex) => void;
}

export function HanoiBoard({
    pegs,
    selectedPeg,
    level,
    onPegClick,
    onDiskMove,
}: HanoiBoardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dragRef = useRef<{ fromPeg: PegIndex | null; diskSize: number }>({
        fromPeg: null,
        diskSize: 0,
    });

    // 绘制游戏画面
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 清空画布
        ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);

        // 绘制底座
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(0, CANVAS.height - CANVAS.baseHeight, CANVAS.width, CANVAS.baseHeight);

        // 绘制三根柱子
        const pegXPositions = [100, 300, 500];
        pegXPositions.forEach((x, index) => {
            // 柱子
            ctx.fillStyle = selectedPeg === index ? '#3b82f6' : '#6b7280';
            ctx.fillRect(
                x - CANVAS.pegWidth / 2,
                CANVAS.height - CANVAS.baseHeight - CANVAS.pegHeight,
                CANVAS.pegWidth,
                CANVAS.pegHeight
            );

            // 绘制该柱子上的圆盘
            const disks = pegs[index];
            disks.forEach((diskSize, diskIndex) => {
                const diskWidth =
                    CANVAS.diskMinWidth +
                    (diskSize - 1) * ((CANVAS.diskMaxWidth - CANVAS.diskMinWidth) / (level - 1 || 1));
                const diskY =
                    CANVAS.height -
                    CANVAS.baseHeight -
                    (diskIndex + 1) * (CANVAS.diskHeight + 4);

                // 圆盘颜色
                ctx.fillStyle = HANOI_CONFIG.diskColors[diskSize - 1] || '#9ca3af';

                // 圆盘圆角矩形
                const radius = 8;
                ctx.beginPath();
                ctx.roundRect(x - diskWidth / 2, diskY, diskWidth, CANVAS.diskHeight, radius);
                ctx.fill();

                // 圆盘高光
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                ctx.roundRect(x - diskWidth / 2 + 4, diskY + 4, diskWidth - 8, 6, 4);
                ctx.fill();
            });
        });
    }, [pegs, selectedPeg, level]);

    // 处理点击
    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const scaleX = canvas.width / rect.width;
            const canvasX = x * scaleX;

            // 判断点击了哪根柱子
            const pegXPositions = [100, 300, 500];
            for (let i = 0; i < 3; i++) {
                if (Math.abs(canvasX - pegXPositions[i]) < 80) {
                    onPegClick(i as PegIndex);
                    break;
                }
            }
        },
        [onPegClick]
    );

    // 处理拖拽开始
    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const canvasX = x * scaleX;
            const canvasY = y * scaleY;

            // 判断点击了哪根柱子的哪个圆盘
            const pegXPositions = [100, 300, 500];
            for (let i = 0; i < 3; i++) {
                if (Math.abs(canvasX - pegXPositions[i]) < 80) {
                    const disks = pegs[i];
                    if (disks.length > 0) {
                        // 检查是否点击了最上面的圆盘
                        const topDiskY =
                            CANVAS.height -
                            CANVAS.baseHeight -
                            disks.length * (CANVAS.diskHeight + 4);
                        if (canvasY >= topDiskY && canvasY <= topDiskY + CANVAS.diskHeight) {
                            dragRef.current = { fromPeg: i as PegIndex, diskSize: disks[disks.length - 1] };
                            return;
                        }
                    }
                    break;
                }
            }
        },
        [pegs]
    );

    // 处理拖拽结束
    const handleMouseUp = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            if (dragRef.current.fromPeg === null) return;

            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const scaleX = canvas.width / rect.width;
            const canvasX = x * scaleX;

            // 判断释放到了哪根柱子
            const pegXPositions = [100, 300, 500];
            for (let i = 0; i < 3; i++) {
                if (Math.abs(canvasX - pegXPositions[i]) < 80) {
                    if (i !== dragRef.current.fromPeg) {
                        onDiskMove(dragRef.current.fromPeg, i as PegIndex);
                    }
                    break;
                }
            }

            dragRef.current = { fromPeg: null, diskSize: 0 };
        },
        [onDiskMove]
    );

    return (
        <canvas
            ref={canvasRef}
            width={CANVAS.width}
            height={CANVAS.height}
            className="w-full max-w-2xl cursor-pointer rounded-lg bg-slate-800 shadow-lg"
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        />
    );
}
