'use client';

import { useCallback, useEffect, useRef } from 'react';
import { BoardConfig, Cell, Disc, MoveRecord } from '../types/game';
import { BOARD_PADDING } from '../constants/config';

interface ReversiBoardProps {
    board: Disc[][];
    config: BoardConfig;
    legalMoves: Cell[];
    lastMove: MoveRecord | null;
    disabled: boolean;
    showHints: boolean;
    onCellClick: (row: number, col: number) => void;
}

export function ReversiBoard({
    board,
    config,
    legalMoves,
    lastMove,
    disabled,
    showHints,
    onCellClick,
}: ReversiBoardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { boardSize, cellSize } = config;
    const canvasSize = BOARD_PADDING * 2 + boardSize * cellSize;

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvasSize * dpr;
        canvas.height = canvasSize * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        // 深绿毡布背景
        const bg = ctx.createLinearGradient(0, 0, 0, canvasSize);
        bg.addColorStop(0, '#0f5132');
        bg.addColorStop(1, '#0a3d24');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        // 网格
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= boardSize; i++) {
            const p = BOARD_PADDING + i * cellSize;
            ctx.beginPath();
            ctx.moveTo(BOARD_PADDING, p);
            ctx.lineTo(BOARD_PADDING + boardSize * cellSize, p);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(p, BOARD_PADDING);
            ctx.lineTo(p, BOARD_PADDING + boardSize * cellSize);
            ctx.stroke();
        }

        // 8x8 棋盘的四个内部星位
        if (boardSize === 8) {
            const stars: Array<[number, number]> = [
                [2, 2],
                [2, 6],
                [6, 2],
                [6, 6],
            ];
            for (const [r, c] of stars) {
                const x = BOARD_PADDING + c * cellSize;
                const y = BOARD_PADDING + r * cellSize;
                ctx.beginPath();
                ctx.arc(x, y, 3.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fill();
            }
        }

        // 提示合法落子点
        if (showHints) {
            for (const { row, col } of legalMoves) {
                const cx = BOARD_PADDING + col * cellSize + cellSize / 2;
                const cy = BOARD_PADDING + row * cellSize + cellSize / 2;
                ctx.beginPath();
                ctx.arc(cx, cy, cellSize * 0.14, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 235, 100, 0.55)';
                ctx.fill();
            }
        }

        // 棋子
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const disc = board[row][col];
                if (!disc) continue;

                const cx = BOARD_PADDING + col * cellSize + cellSize / 2;
                const cy = BOARD_PADDING + row * cellSize + cellSize / 2;
                const radius = cellSize * 0.4;

                // 阴影
                ctx.beginPath();
                ctx.arc(cx + 1.5, cy + 2, radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0,0,0,0.35)';
                ctx.fill();

                // 主体渐变
                const grad = ctx.createRadialGradient(
                    cx - radius * 0.35,
                    cy - radius * 0.4,
                    radius * 0.1,
                    cx,
                    cy,
                    radius
                );
                if (disc === 'black') {
                    grad.addColorStop(0, '#5a5a5a');
                    grad.addColorStop(1, '#0a0a0a');
                } else {
                    grad.addColorStop(0, '#ffffff');
                    grad.addColorStop(1, '#c8c8c8');
                }
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            }
        }

        // 最后一手高亮
        if (lastMove) {
            const cx = BOARD_PADDING + lastMove.col * cellSize + cellSize / 2;
            const cy = BOARD_PADDING + lastMove.row * cellSize + cellSize / 2;
            ctx.beginPath();
            ctx.arc(cx, cy, cellSize * 0.44, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 90, 90, 0.9)';
            ctx.lineWidth = 2.2;
            ctx.stroke();
        }
    }, [board, boardSize, cellSize, canvasSize, legalMoves, lastMove, showHints]);

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

        const col = Math.floor((x - BOARD_PADDING) / cellSize);
        const row = Math.floor((y - BOARD_PADDING) / cellSize);
        if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
            onCellClick(row, col);
        }
    };

    return (
        <canvas
            ref={canvasRef}
            style={{ width: canvasSize, height: canvasSize }}
            className="rounded-lg shadow-2xl cursor-pointer"
            onClick={handleClick}
        />
    );
}
