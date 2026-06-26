'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Stone, MoveRecord, BoardConfig } from '../types/game';
import { BOARD_PADDING, STAR_POINTS } from '../constants/config';

interface GomokuBoardProps {
    board: Stone[][];
    config: BoardConfig;
    lastMove: MoveRecord | null;
    winLine: Array<{ row: number; col: number }> | null;
    disabled: boolean;
    onCellClick: (row: number, col: number) => void;
}

export function GomokuBoard({
    board,
    config,
    lastMove,
    winLine,
    disabled,
    onCellClick,
}: GomokuBoardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { boardSize, cellSize } = config;
    const canvasSize = BOARD_PADDING * 2 + (boardSize - 1) * cellSize;

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvasSize * dpr;
        canvas.height = canvasSize * dpr;
        ctx.scale(dpr, dpr);

        // 木色背景
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        // 网格线
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.8;
        for (let i = 0; i < boardSize; i++) {
            const pos = BOARD_PADDING + i * cellSize;
            ctx.beginPath();
            ctx.moveTo(BOARD_PADDING, pos);
            ctx.lineTo(BOARD_PADDING + (boardSize - 1) * cellSize, pos);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pos, BOARD_PADDING);
            ctx.lineTo(pos, BOARD_PADDING + (boardSize - 1) * cellSize);
            ctx.stroke();
        }

        // 星位点
        for (const { row, col } of STAR_POINTS) {
            const x = BOARD_PADDING + col * cellSize;
            const y = BOARD_PADDING + row * cellSize;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#333';
            ctx.fill();
        }

        // 获胜连线高亮
        const winSet = new Set<string>();
        if (winLine) {
            for (const { row, col } of winLine) {
                winSet.add(`${row},${col}`);
            }
        }

        // 棋子
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const stone = board[row][col];
                if (!stone) continue;

                const x = BOARD_PADDING + col * cellSize;
                const y = BOARD_PADDING + row * cellSize;
                const radius = cellSize * 0.42;

                // 径向渐变模拟立体感
                const gradient = ctx.createRadialGradient(
                    x - radius * 0.3,
                    y - radius * 0.3,
                    radius * 0.1,
                    x,
                    y,
                    radius
                );

                if (stone === 'black') {
                    gradient.addColorStop(0, '#555');
                    gradient.addColorStop(1, '#000');
                } else {
                    gradient.addColorStop(0, '#fff');
                    gradient.addColorStop(1, '#ccc');
                }

                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // 白棋边框
                if (stone === 'white') {
                    ctx.strokeStyle = '#999';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }

                // 获胜棋子高亮
                if (winSet.has(`${row},${col}`)) {
                    ctx.beginPath();
                    ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(255, 50, 50, 0.8)';
                    ctx.lineWidth = 2.5;
                    ctx.stroke();
                }
            }
        }

        // 最后一步标记
        if (lastMove && !winLine) {
            const x = BOARD_PADDING + lastMove.col * cellSize;
            const y = BOARD_PADDING + lastMove.row * cellSize;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 50, 50, 0.9)';
            ctx.fill();
        }
    }, [board, boardSize, cellSize, canvasSize, lastMove, winLine]);

    useEffect(() => {
        draw();
    }, [draw]);

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (disabled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvasSize / rect.width;
        const scaleY = canvasSize / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const col = Math.round((x - BOARD_PADDING) / cellSize);
        const row = Math.round((y - BOARD_PADDING) / cellSize);

        if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
            onCellClick(row, col);
        }
    };

    return (
        <canvas
            ref={canvasRef}
            style={{ width: canvasSize, height: canvasSize }}
            className="rounded-lg shadow-lg cursor-pointer"
            onClick={handleClick}
        />
    );
}
