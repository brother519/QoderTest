'use client';

import { useEffect, useCallback } from 'react';
import { useTankGame } from './hooks/useTankGame';
import { TankCanvas } from './components/TankCanvas';
import { TankControls } from './components/TankControls';
import { DEFAULT_CONFIG } from './constants/config';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';

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

export default function TankBattlePage() {
  const game = useTankGame(DEFAULT_CONFIG);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const action = KEY_MAP[key];

      if (action) {
        e.preventDefault();
        if (game.status === 'idle') game.start();
        game.setKey(action, true);
        return;
      }
      if (key === 'p' && (game.status === 'playing' || game.status === 'paused')) {
        game.togglePause();
      }
      if (key === 'r') {
        game.restart();
      }
    },
    [game]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const action = KEY_MAP[key];
      if (action) {
        game.setKey(action, false);
      }
    },
    [game]
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
    <GameLayout title="坦克大战" className="bg-[#1a1a2e] flex items-center justify-center py-8 px-4">
      <div className="text-center pt-8">
        <h1 className="text-3xl font-bold text-orange-400 mb-6">
          坦克大战
        </h1>

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

        <div className="mt-4 text-gray-500 text-sm">
          WASD / 方向键移动 &nbsp;|&nbsp; 空格 / J 射击 &nbsp;|&nbsp; P 暂停 &nbsp;|&nbsp; R 重新开始
        </div>
      </div>
    </GameLayout>
  );
}
