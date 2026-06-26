/**
 * 接水管游戏棋盘渲染组件
 *
 * 使用 SVG 绘制管道棋盘，支持点击旋转和水流动画。
 *
 * @module pipe-puzzle/components/PipeBoard
 */

'use client';

import { PipeCell, PipeType, Rotation } from '../types/game';
import { CELL_SIZE, PIPE_WIDTH_RATIO } from '../constants/config';

interface PipeBoardProps {
    board: PipeCell[][];
    onRotate: (row: number, col: number) => void;
    disabled?: boolean;
}

/** 各管道类型在 rotation=0 时的开口方向索引 */
const PIPE_OPENINGS: Record<PipeType, number[]> = {
    straight: [0, 2],
    corner: [0, 1],
    tee: [0, 1, 2],
    cross: [0, 1, 2, 3],
    end: [0],
};

/** 方向到弧度映射 (0=top, 1=right, 2=bottom, 3=left) */
const DIR_ANGLES = [
    Math.PI * 1.5, // top (270°)
    0, // right (0°)
    Math.PI * 0.5, // bottom (90°)
    Math.PI, // left (180°)
];

/** 绘制单个管道格子的 SVG 路径 */
function renderPipe(
    type: PipeType,
    rotation: Rotation,
    filled: boolean,
    isSource: boolean,
    isTarget: boolean
): React.ReactNode {
    const size = CELL_SIZE;
    const center = size / 2;
    const pipeWidth = size * PIPE_WIDTH_RATIO;
    const halfPipe = pipeWidth / 2;

    const openings = PIPE_OPENINGS[type].map((d) => (d + rotation) % 4);

    const strokeColor = filled ? '#38bdf8' : '#6b7280';
    const fillColor = filled ? '#0ea5e9' : '#374151';

    // 从中心到边缘的管道线段
    const segments: React.ReactNode[] = [];

    openings.forEach((dir, idx) => {
        let x1: number, y1: number, x2: number, y2: number;
        let rectX: number, rectY: number, rectW: number, rectH: number;

        switch (dir) {
            case 0: // top
                rectX = center - halfPipe;
                rectY = 0;
                rectW = pipeWidth;
                rectH = center;
                break;
            case 1: // right
                rectX = center;
                rectY = center - halfPipe;
                rectW = center;
                rectH = pipeWidth;
                break;
            case 2: // bottom
                rectX = center - halfPipe;
                rectY = center;
                rectW = pipeWidth;
                rectH = center;
                break;
            default: // left
                rectX = 0;
                rectY = center - halfPipe;
                rectW = center;
                rectH = pipeWidth;
                break;
        }

        segments.push(
            <rect
                key={`seg-${idx}`}
                x={rectX}
                y={rectY}
                width={rectW}
                height={rectH}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={1.5}
                rx={2}
            />
        );
    });

    // 中心圆点
    const centerNode = (
        <circle
            key="center"
            cx={center}
            cy={center}
            r={halfPipe + 2}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={1.5}
        />
    );

    // 起点/终点标记
    let marker: React.ReactNode = null;
    if (isSource) {
        marker = (
            <g key="source-marker">
                <circle cx={center} cy={center} r={8} fill="#22c55e" />
                <text
                    x={center}
                    y={center + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={10}
                    fill="white"
                    fontWeight="bold"
                >
                    S
                </text>
            </g>
        );
    } else if (isTarget) {
        marker = (
            <g key="target-marker">
                <circle cx={center} cy={center} r={8} fill="#ef4444" />
                <text
                    x={center}
                    y={center + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={10}
                    fill="white"
                    fontWeight="bold"
                >
                    E
                </text>
            </g>
        );
    }

    return (
        <>
            {segments}
            {centerNode}
            {marker}
        </>
    );
}

export function PipeBoard({ board, onRotate, disabled }: PipeBoardProps) {
    if (board.length === 0) return null;

    const rows = board.length;
    const cols = board[0].length;
    const width = cols * CELL_SIZE;
    const height = rows * CELL_SIZE;

    return (
        <svg
            width={width}
            height={height}
            className="border-2 border-gray-600 rounded-lg bg-gray-900"
        >
            {/* 网格线 */}
            {Array.from({ length: rows + 1 }, (_, i) => (
                <line
                    key={`h-${i}`}
                    x1={0}
                    y1={i * CELL_SIZE}
                    x2={width}
                    y2={i * CELL_SIZE}
                    stroke="#1f2937"
                    strokeWidth={1}
                />
            ))}
            {Array.from({ length: cols + 1 }, (_, i) => (
                <line
                    key={`v-${i}`}
                    x1={i * CELL_SIZE}
                    y1={0}
                    x2={i * CELL_SIZE}
                    y2={height}
                    stroke="#1f2937"
                    strokeWidth={1}
                />
            ))}

            {/* 管道格子 */}
            {board.map((row, ri) =>
                row.map((cell, ci) => (
                    <g
                        key={`${ri}-${ci}`}
                        transform={`translate(${ci * CELL_SIZE}, ${ri * CELL_SIZE})`}
                        onClick={() => !disabled && onRotate(ri, ci)}
                        className={disabled ? '' : 'cursor-pointer'}
                        role="button"
                        tabIndex={0}
                    >
                        {/* 背景 */}
                        <rect
                            width={CELL_SIZE}
                            height={CELL_SIZE}
                            fill={cell.filled ? '#0c4a6e' : '#111827'}
                            className={
                                disabled
                                    ? ''
                                    : 'hover:fill-gray-800 transition-colors'
                            }
                        />
                        {renderPipe(
                            cell.type,
                            cell.rotation,
                            cell.filled,
                            cell.isSource,
                            cell.isTarget
                        )}
                    </g>
                ))
            )}
        </svg>
    );
}
