import { useEffect, useRef } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { Renderer } from '../rendering/Renderer';
import { levels } from '../data/levels';
import { useGameStore } from '../state/GameStore';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/config';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const updateFromEngine = useGameStore((s) => s.updateFromEngine);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup canvas resolution
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    canvas.style.width = `${CANVAS_WIDTH}px`;
    canvas.style.height = `${CANVAS_HEIGHT}px`;
    ctx.scale(dpr, dpr);

    // Create engine and renderer
    const engine = new GameEngine(levels);
    const renderer = new Renderer(ctx);

    engine.setUICallback(updateFromEngine);
    engine.start();

    engineRef.current = engine;
    rendererRef.current = renderer;
    lastTimeRef.current = performance.now();

    // Render loop (separate from engine update loop)
    const renderLoop = (time: number) => {
      const dt = Math.min(time - lastTimeRef.current, 50);
      lastTimeRef.current = time;
      renderer.render(engine.state, dt);
      rafRef.current = requestAnimationFrame(renderLoop);
    };

    rafRef.current = requestAnimationFrame(renderLoop);

    // Focus canvas for keyboard input
    canvas.focus();

    return () => {
      engine.stop();
      cancelAnimationFrame(rafRef.current);
    };
  }, [updateFromEngine]);

  return (
    <canvas
      ref={canvasRef}
      tabIndex={0}
      style={{
        display: 'block',
        margin: '0 auto',
        outline: 'none',
        cursor: 'none',
        imageRendering: 'pixelated',
        border: '2px solid #333',
      }}
    />
  );
}
