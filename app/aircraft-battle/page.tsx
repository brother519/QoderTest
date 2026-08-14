/**
 * 飞机大战游戏主页面
 *
 * 整合 useAircraftBattleGame Hook 与所有 UI 组件，处理键盘事件（按下/抬起）。
 * 包含游戏画布、控制面板、遮罩层和操作提示。
 * 访问路径：/aircraft-battle
 *
 * @module aircraft-battle/page
 */

'use client';

import { useAircraftBattleGame } from './hooks/useAircraftBattleGame';
import { AircraftCanvas } from './components/AircraftCanvas';
import { AircraftControls } from './components/AircraftControls';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { ControlHints } from '@/lib/components/ControlHints';
import { useKeyboard } from '@/lib/hooks/useKeyboard';

const KEY_MAP: Record<string, string> = {
    ArrowUp: 'UP', w: 'UP', W: 'UP',
    ArrowDown: 'DOWN', s: 'DOWN', S: 'DOWN',
    ArrowLeft: 'LEFT', a: 'LEFT', A: 'LEFT',
    ArrowRight: 'RIGHT', d: 'RIGHT', D: 'RIGHT',
    ' ': 'SHOOT', j: 'SHOOT', J: 'SHOOT',
    p: 'PAUSE', P: 'PAUSE',
    r: 'RESTART', R: 'RESTART',
};

export default function AircraftBattlePage() {
    const { state, highScore, start, restart, togglePause, setKey } = useAircraftBattleGame();

    useKeyboard(KEY_MAP, {
        onKeyDown: (action) => {
            if (['UP', 'DOWN', 'LEFT', 'RIGHT', 'SHOOT'].includes(action)) {
                if (state.status === 'idle') start();
                setKey(action, true);
                return;
            }
            if (action === 'PAUSE') togglePause();
            if (action === 'RESTART' && (state.status === 'over' || state.status === 'paused')) {
                restart();
            }
        },
        onKeyUp: (action) => {
            if (['UP', 'DOWN', 'LEFT', 'RIGHT', 'SHOOT'].includes(action)) {
                setKey(action, false);
            }
        },
    });

  return (
    <GameLayout title="飞机大战" className="bg-[#0f172a] flex items-center justify-center py-8 px-4">
      <div className="text-center pt-8">
        <GamePageHeader title="飞机大战" />

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

        <ControlHints hints={['WASD / 方向键移动', '空格 / J 射击', 'P 暂停', 'R 重新开始']} />
      </div>
    </GameLayout>
  );
}
