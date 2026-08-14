/**
 * 坦克大战游戏主页面
 *
 * 整合 useTankBattleGame Hook 与所有 UI 组件，处理键盘事件（按下/抬起）。
 * 包含游戏画布、控制面板、遮罩层和操作提示。
 * 访问路径：/tank-battle
 *
 * @module tank-battle/page
 */

'use client';

import { useTankBattleGame } from './hooks/useTankBattleGame';
import { TankCanvas } from './components/TankCanvas';
import { TankControls } from './components/TankControls';
import { DEFAULT_CONFIG } from './constants/config';
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

export default function TankBattlePage() {
    const game = useTankBattleGame(DEFAULT_CONFIG);

    useKeyboard(KEY_MAP, {
        onKeyDown: (action) => {
            if (['UP', 'DOWN', 'LEFT', 'RIGHT', 'SHOOT'].includes(action)) {
                if (game.status === 'idle') game.start();
                game.setKey(action, true);
                return;
            }
            if (action === 'PAUSE' && (game.status === 'playing' || game.status === 'paused')) {
                game.togglePause();
            }
            if (action === 'RESTART') game.restart();
        },
        onKeyUp: (action) => {
            if (['UP', 'DOWN', 'LEFT', 'RIGHT', 'SHOOT'].includes(action)) {
                game.setKey(action, false);
            }
        },
    });

  return (
    <GameLayout title="坦克大战" className="bg-[#1a1a2e] flex items-center justify-center py-8 px-4">
      <div className="text-center pt-8">
        <GamePageHeader title="坦克大战" colorClass="text-orange-400" />

        <TankControls
          score={game.score}
          highScore={game.highScore}
          lives={game.lives}
          enemiesRemaining={game.enemiesRemaining}
          status={game.status}
          onStart={game.start}
          onTogglePause={game.togglePause}
          onRestart={game.restart}
        />

        <div className="relative inline-block mt-4">
          <TankCanvas
            config={DEFAULT_CONFIG}
            map={game.map}
            player={game.player}
            enemies={game.enemies}
            playerBullets={game.playerBullets}
            enemyBullets={game.enemyBullets}
            explosions={game.explosions}
            powerUps={game.powerUps}
            tankSize={game.tankSize}
            bulletSize={game.bulletSize}
            shieldTimer={game.shieldTimer}
          />

          <GameOverlay visible={game.status === 'paused'}>
            <span className="text-orange-400 text-3xl font-bold">暂停</span>
          </GameOverlay>

          <GameOverlay visible={game.status === 'over'} bgClass="bg-black/70">
            <span className="text-red-400 text-2xl font-bold">游戏结束</span>
            <span className="text-white text-lg">得分: {game.score}</span>
          </GameOverlay>

          <GameOverlay visible={game.status === 'won'} bgClass="bg-black/60">
            <span className="text-yellow-400 text-2xl font-bold">胜利！</span>
            <span className="text-white text-lg">得分: {game.score}</span>
          </GameOverlay>

          <GameOverlay visible={game.status === 'idle'}>
            <span className="text-orange-400 text-xl font-bold">坦克大战</span>
            <span className="text-gray-300 text-sm">点击&quot;开始游戏&quot;或按方向键开始</span>
          </GameOverlay>
        </div>

        <ControlHints hints={['WASD / 方向键移动', '空格 / J 射击', 'P 暂停', 'R 重新开始']} />
      </div>
    </GameLayout>
  );
}
