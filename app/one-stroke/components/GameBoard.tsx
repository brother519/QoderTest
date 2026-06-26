/**
 * 一笔画游戏棋盘组件（SVG）
 *
 * 渲染图的节点和边，支持点击交互。
 * - 未走的边：灰色虚线
 * - 已走的边：彩色实线（按走过顺序渐变色）
 * - 当前节点：高亮脉冲圆
 *
 * @module one-stroke/components/GameBoard
 */

'use client';

import { Level } from '../types/game';
import { SVG_SIZE, NODE_RADIUS, EDGE_STROKE_WIDTH, TRAVERSED_COLORS } from '../constants/config';

interface GameBoardProps {
    level: Level;
    currentNodeId: number | null;
    traversedEdgeIds: Set<number>;
    /** 路径步骤（用于取色顺序） */
    pathEdgeIds: number[];
    onNodeClick: (nodeId: number) => void;
    disabled?: boolean;
    isStuck?: boolean;
}

export function GameBoard({
    level,
    currentNodeId,
    traversedEdgeIds,
    pathEdgeIds,
    onNodeClick,
    disabled = false,
    isStuck = false,
}: GameBoardProps) {
    const { nodes, edges } = level;

    // 节点 id → 坐标的 Map
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    // 取某条边走过的顺序（0-based），未走过返回 -1
    function getEdgeTraversalIndex(edgeId: number): number {
        return pathEdgeIds.indexOf(edgeId);
    }

    return (
        <div className="relative select-none">
            <svg
                width={SVG_SIZE}
                height={SVG_SIZE}
                viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                className="block"
                style={{ background: 'transparent' }}
            >
                {/* ── 边 ── */}
                {edges.map((edge) => {
                    const fromNode = nodeMap.get(edge.from);
                    const toNode = nodeMap.get(edge.to);
                    if (!fromNode || !toNode) return null;

                    const traversed = traversedEdgeIds.has(edge.id);
                    const idx = getEdgeTraversalIndex(edge.id);
                    const color = traversed
                        ? TRAVERSED_COLORS[idx % TRAVERSED_COLORS.length]
                        : '#4b5563';

                    return (
                        <line
                            key={edge.id}
                            x1={fromNode.x}
                            y1={fromNode.y}
                            x2={toNode.x}
                            y2={toNode.y}
                            stroke={color}
                            strokeWidth={EDGE_STROKE_WIDTH}
                            strokeLinecap="round"
                            strokeDasharray={traversed ? 'none' : '10 6'}
                            opacity={traversed ? 1 : 0.55}
                            style={{
                                transition: 'stroke 0.3s, opacity 0.3s',
                                filter: traversed
                                    ? `drop-shadow(0 0 4px ${color}88)`
                                    : 'none',
                            }}
                        />
                    );
                })}

                {/* ── 节点 ── */}
                {nodes.map((node) => {
                    const isCurrent = node.id === currentNodeId;
                    const adjacentEdges = edges.filter(
                        (e) => e.from === node.id || e.to === node.id
                    );
                    const canReach =
                        currentNodeId !== null &&
                        currentNodeId !== node.id &&
                        adjacentEdges.some(
                            (e) =>
                                (e.from === currentNodeId || e.to === currentNodeId) &&
                                !traversedEdgeIds.has(e.id)
                        );

                    const handleClick = () => {
                        if (!disabled) {
                            onNodeClick(node.id);
                        }
                    };

                    return (
                        <g
                            key={node.id}
                            onClick={handleClick}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') handleClick();
                            }}
                            style={{ cursor: disabled ? 'default' : 'pointer' }}
                        >
                            {/* 透明点击热区（确保整个区域可点击） */}
                            <circle
                                cx={node.x}
                                cy={node.y}
                                r={NODE_RADIUS + 8}
                                fill="rgba(0,0,0,0.001)"
                                stroke="none"
                            />
                            {/* 当前节点光晕动画 */}
                            {isCurrent && (
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={NODE_RADIUS + 8}
                                    fill="none"
                                    stroke="#facc15"
                                    strokeWidth={2}
                                    opacity={0.6}
                                >
                                    <animate
                                        attributeName="r"
                                        values={`${NODE_RADIUS + 4};${NODE_RADIUS + 14};${NODE_RADIUS + 4}`}
                                        dur="1.4s"
                                        repeatCount="indefinite"
                                    />
                                    <animate
                                        attributeName="opacity"
                                        values="0.6;0.1;0.6"
                                        dur="1.4s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                            )}

                            {/* 可到达节点提示光圈 */}
                            {canReach && !disabled && (
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={NODE_RADIUS + 5}
                                    fill="none"
                                    stroke="#38bdf8"
                                    strokeWidth={1.5}
                                    opacity={0.5}
                                    strokeDasharray="4 3"
                                />
                            )}

                            {/* 死局时当前节点变红 */}
                            {isStuck && isCurrent && (
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={NODE_RADIUS + 6}
                                    fill="#ef444422"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                />
                            )}

                            {/* 主节点圆 */}
                            <circle
                                cx={node.x}
                                cy={node.y}
                                r={NODE_RADIUS}
                                fill={isCurrent ? '#facc15' : '#1e293b'}
                                stroke={isCurrent ? '#fde047' : canReach ? '#38bdf8' : '#64748b'}
                                strokeWidth={isCurrent ? 3 : 2}
                                style={{ transition: 'fill 0.2s, stroke 0.2s' }}
                            />

                            {/* 节点编号 */}
                            <text
                                x={node.x}
                                y={node.y + 5}
                                textAnchor="middle"
                                fontSize="13"
                                fontWeight="bold"
                                fill={isCurrent ? '#1e293b' : '#94a3b8'}
                                style={{ pointerEvents: 'none', userSelect: 'none' }}
                            >
                                {node.id + 1}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
