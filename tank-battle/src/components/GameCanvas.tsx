import React, { useRef, useEffect } from 'react';
import { useGame } from '../game/state/GameContext';
import { RenderSystem } from '../game/systems/RenderSystem';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state } = useGame();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    RenderSystem.render(ctx, state);
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{
        border: '2px solid #333',
        display: 'block',
        imageRendering: 'pixelated',
      }}
    />
  );
}
