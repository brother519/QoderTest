/**
 * 打地鼠游戏主页面
 *
 * @module whack-a-mole/page
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useWhackAMoleGame } from './hooks/useWhackAMoleGame';
import { MoleGrid } from './components/MoleGrid';
import { GameControls } from './components/GameControls';
import { DEFAULT_CONFIG } from './constants/config';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { GameStats } from './types/game';

/**
 * 游戏结束统计面板
 *
 * 展示游戏结束后的统计数据，包括最终得分、击中次数、未中次数、
 * 命中率、最高连击和逃跑地鼠数。
 *
 * @param stats - 游戏统计数据
 * @param score - 最终得分
 */
function GameOverStats({ stats, score }: { stats: GameStats; score: number }) {
  const totalClicks = stats.hits + stats.misses; // 总点击次数（击中 + 未中）
  const accuracy = totalClicks > 0 ? Math.round((stats.hits / totalClicks) * 100) : 0; // 命中率百分比

  return (
    <div className="space-y-3 text-center">
      <div className="text-amber-400 text-2xl font-bold">游戏结束</div>
      <div className="text-white text-3xl font-bold">{score} 分</div>
      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
        <div className="bg-white/10 rounded-lg p-2">
          <div className="text-amber-300 text-xs">击中</div>
          <div className="text-white font-bold text-lg">{stats.hits}</div>
        </div>
        <div className="bg-white/10 rounded-lg p-2">
          <div className="text-amber-300 text-xs">未中</div>
          <div className="text-white font-bold text-lg">{stats.misses}</div>
        </div>
        <div className="bg-white/10 rounded-lg p-2">
          <div className="text-amber-300 text-xs">命中率</div>
          <div className="text-white font-bold text-lg">{accuracy}%</div>
        </div>
        <div className="bg-white/10 rounded-lg p-2">
          <div className="text-amber-300 text-xs">最高连击</div>
          <div className="text-orange-400 font-bold text-lg">{stats.maxCombo}</div>
        </div>
      </div>
      <div className="text-amber-200/50 text-xs">逃跑 {stats.escapes} 只地鼠</div>
    </div>
  );
}

/** 地鼠类型图例组件，展示三种地鼠类型及其对应分值 */
function MoleLegend() {
  return (
    <div className="flex items-center justify-center gap-4 text-sm">
      <div className="flex items-center gap-1">
        <span>🐹</span>
        <span className="text-amber-200/70">普通 +10</span>
      </div>
      <div className="flex items-center gap-1">
        <span>🌟</span>
        <span className="text-yellow-300/70">金色 +25</span>
      </div>
      <div className="flex items-center gap-1">
        <span>💣</span>
        <span className="text-red-300/70">炸弹 -15</span>
      </div>
    </div>
  );
}

/**
 * 打地鼠游戏主页面组件
 *
 * 作为游戏的入口路由页面（/whack-a-mole），整合所有子组件：
 * - GameControls：得分、时间、连击等信息面板与操作按钮
 * - MoleGrid：地鼠洞网格，处理点击交互
 * - GameOverlay：暂停、结束、待开始等覆盖层
 * - MoleLegend：地鼠类型说明图例
 *
 * 键盘快捷键：
 * - P：暂停/继续
 * - R：重新开始
 * - 空格：开始游戏（idle 状态）或重新开始（over 状态）
 */
export default function WhackAMolePage() {
  const game = useWhackAMoleGame(DEFAULT_CONFIG); // 初始化游戏核心逻辑

  /**
   * 键盘事件处理
   * 监听 P（暂停/继续）、R（重新开始）、空格（开始/重新开始）
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'p' && (game.status === 'playing' || game.status === 'paused')) {
        game.togglePause();
      }
      if (key === 'r') {
        game.restart();
      }
      if (key === ' ') {
        e.preventDefault();
        if (game.status === 'idle') {
          game.start();
        } else if (game.status === 'over') {
          game.restart();
        }
      }
    },
    [game]
  );

  /** 注册全局键盘事件监听，组件卸载时移除 */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const isGameActive = game.status === 'playing'; // 仅在 playing 状态允许点击地鼠

  return (
    <GameLayout title="打地鼠" className="bg-gradient-to-b from-green-950 via-amber-950 to-amber-950 flex items-center justify-center py-6 px-4">
      <div className="text-center w-full max-w-xl">
        <h1 className="text-3xl font-bold text-amber-400 mb-4 drop-shadow-lg">🔨 打地鼠</h1>
        <div className="mb-3"><MoleLegend /></div>
        <GameControls
          score={game.score}
          highScore={game.highScore}
          timeLeft={game.timeLeft}
          totalTime={DEFAULT_CONFIG.gameDuration}
          combo={game.combo}
          status={game.status}
          onStart={game.start}
          onTogglePause={game.togglePause}
          onRestart={game.restart}
        />
        <div className="relative inline-block">
          <MoleGrid
            holes={game.holes}
            config={DEFAULT_CONFIG}
            scorePopups={game.scorePopups}
            disabled={!isGameActive}
            onWhack={game.whack}
          />
          <GameOverlay visible={game.status === 'paused'}>
            <span className="text-amber-400 text-3xl font-bold">⏸ 暂停</span>
            <span className="text-gray-300 text-sm mt-1">按 P 继续</span>
          </GameOverlay>
          <GameOverlay visible={game.status === 'over'} bgClass="bg-black/70">
            <GameOverStats stats={game.stats} score={game.score} />
            {game.score >= game.highScore && game.score > 0 && (
              <span className="text-yellow-400 text-sm animate-pulse mt-2 block">🎉 新纪录！</span>
            )}
          </GameOverlay>
          <GameOverlay visible={game.status === 'idle'}>
            <div className="space-y-3 text-center">
              <div className="text-6xl animate-bounce">🐹</div>
              <div className="text-amber-400 text-xl font-bold">准备好了吗？</div>
              <div className="text-gray-300 text-sm">点击 &quot;开始游戏&quot; 或按空格键</div>
              <MoleLegend />
            </div>
          </GameOverlay>
        </div>
        <div className="mt-4 text-amber-200/50 text-xs space-y-1">
          <div>点击地鼠得分 | P 暂停 | R 重新开始 | 空格 开始</div>
          <div>连击 {'>='}3 有奖励加成 | 注意躲避炸弹 💣</div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translate(-50%, -100%); }
          100% { opacity: 0; transform: translate(-50%, -250%); }
        }
      `}</style>
    </GameLayout>
  );
}
