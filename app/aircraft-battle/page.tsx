/**
 * 飞机大战游戏主页面
 *
 * 整合 useAircraftGame Hook 与所有 UI 组件，处理键盘事件（按下/抬起）。
 * 包含游戏画布、控制面板、遮罩层和操作提示。
 * 访问路径：/aircraft-battle
 *
 * @module aircraft-battle/page
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useAircraftGame } from './hooks/useAircraftGame';
import { AircraftCanvas } from './components/AircraftCanvas';
import { AircraftControls } from './components/AircraftControls';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';

/** 键盘按键到操作的映射（支持方向键、WASD、空格/J射击） */
const KEY_MAP: Record<string, string> = {
  arrowup: 'UP',
  w: 'UP',
  arrowdown: 'DOWN',
  s: 'DOWN',
  arrowleft: 'LEFT',
  a: 'LEFT',
  arrowright: 'RIGHT',
  d: 'RIGHT',
  ' ': 'SHOOT',
  j: 'SHOOT',
};

export default function AircraftBattlePage() {
  const { state, highScore, start, restart, togglePause, setKey } = useAircraftGame();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const action = KEY_MAP[key];

      if (action) {
        e.preventDefault();
        if (state.status === 'idle') start();
        setKey(action, true);
        return;
      }

      if (key === 'p') {
        togglePause();
      }

      // 在暂停或游戏结束时按 R 都可以重新开始
      if (key === 'r' && (state.status === 'over' || state.status === 'paused')) {
        restart();
      }
    },
    [setKey, togglePause, restart, state.status, start]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const action = KEY_MAP[key];
      if (action) {
        setKey(action, false);
      }
    },
    [setKey]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <GameLayout title="飞机大战" className="bg-[#0f172a] flex items-center justify-center py-8 px-4">
      <div className="text-center pt-8">
        <h1 className="text-3xl font-bold text-cyan-400 mb-6">
          飞机大战
        </h1>

        <AircraftControls
          state={state}
          highScore={highScore}
          onStart={start}
          onRestart={restart}
          onTogglePause={togglePause}
        />

        <div className="relative inline-block mt-4">
          <AircraftCanvas state={state} />

          <GameOverlay visible={state.status === 'paused'}>
            <span className="text-cyan-400 text-3xl font-bold">暂停</span>
          </GameOverlay>

          <GameOverlay visible={state.status === 'over'} bgClass="bg-black/70">
            <span className="text-red-400 text-2xl font-bold">游戏结束</span>
            <span className="text-white text-lg">得分: {state.score}</span>
          </GameOverlay>

          <GameOverlay visible={state.status === 'idle'}>
            <span className="text-cyan-400 text-xl font-bold">飞机大战</span>
            <span className="text-slate-300 text-sm">点击"开始游戏"或按方向键开始</span>
          </GameOverlay>
        </div>

        <div className="mt-4 text-slate-500 text-sm">
          WASD / 方向键移动 &nbsp;|&nbsp; 空格 / J 射击 &nbsp;|&nbsp; P 暂停 &nbsp;|&nbsp; R 重新开始
        </div>
      </div>
    </GameLayout>
  );
}
