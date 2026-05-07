/**
 * 扫雷游戏主页面
 *
 * @module minesweeper/page
 */

'use client';

import { useCallback, useEffect } from 'react';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { DEFAULT_DIFFICULTY } from './constants/config';
import { useMinesweeperGame } from './hooks/useMinesweeperGame';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { formatTime } from '@/lib/utils/format';

export default function MinesweeperPage() {
  const game = useMinesweeperGame(DEFAULT_DIFFICULTY);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === 'r') {
        game.restart();
      }

      if (key === '1') {
        game.changeDifficulty('beginner');
      }

      if (key === '2') {
        game.changeDifficulty('intermediate');
      }

      if (key === '3') {
        game.changeDifficulty('expert');
      }
    },
    [game]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <GameLayout
      title="扫雷"
      className="bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_38%),linear-gradient(180deg,#03131b_0%,#08111f_45%,#111827_100%)] py-8 px-4"
    >
      <div className="relative max-w-7xl mx-auto pt-12">
        <div className="absolute inset-x-0 top-4 flex justify-center pointer-events-none">
          <div className="h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-100/70 text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              经典逻辑游戏 · 首击安全 · 长按插旗
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-[0_0_30px_rgba(34,211,238,0.16)]">
              💣 扫雷
            </h1>
            <p className="max-w-2xl mx-auto text-cyan-50/70 leading-relaxed text-sm md:text-base">
              左键揭开格子，右键或长按标记地雷。首次点击与周围 8 格绝对安全，尽可能用最短时间完成整局排雷。
            </p>
          </div>

          <Controls
            difficultyKey={game.difficultyKey}
            remainingMines={game.remainingMines}
            elapsedTime={game.elapsedTime}
            bestTime={game.bestTime}
            status={game.status}
            onChangeDifficulty={game.changeDifficulty}
            onRestart={game.restart}
          />

          <div className="rounded-[32px] border border-cyan-400/10 bg-white/[0.03] backdrop-blur-sm px-3 py-4 md:px-5 md:py-6 shadow-[0_24px_80px_rgba(2,12,27,0.45)]">
            <Board
              board={game.board}
              difficulty={game.difficulty}
              status={game.status}
              onReveal={game.revealCell}
              onToggleFlag={game.toggleFlag}
              onChord={game.chordCell}
              overlay={
                <>
                  <GameOverlay visible={game.status === 'won'} bgClass="bg-emerald-950/75 backdrop-blur-sm">
                    <span className="text-4xl">🏆</span>
                    <span className="text-2xl font-black text-emerald-300">排雷完成</span>
                    <span className="text-white text-base">本局用时 {formatTime(game.elapsedTime)}</span>
                    <span className="text-emerald-100/75 text-sm">
                      最佳时间 {game.bestTime === null ? '--:--' : formatTime(game.bestTime)}
                    </span>
                    <button
                      type="button"
                      onClick={game.restart}
                      className="px-5 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-bold hover:bg-emerald-300 transition-colors"
                    >
                      再来一局
                    </button>
                  </GameOverlay>

                  <GameOverlay visible={game.status === 'lost'} bgClass="bg-slate-950/80 backdrop-blur-sm">
                    <span className="text-4xl">💥</span>
                    <span className="text-2xl font-black text-rose-300">踩到地雷了</span>
                    <span className="text-white/80 text-sm">复盘数字关系，再试一次就能更快通关。</span>
                    <button
                      type="button"
                      onClick={game.restart}
                      className="px-5 py-2.5 rounded-xl bg-rose-400 text-slate-950 font-bold hover:bg-rose-300 transition-colors"
                    >
                      重新挑战
                    </button>
                  </GameOverlay>
                </>
              }
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3 text-sm">
            <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3 text-cyan-50/75">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-200/45">桌面操作</div>
              <div className="mt-2">左键揭开，右键插旗，双击数字格可快速展开周围。</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3 text-cyan-50/75">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-200/45">移动端操作</div>
              <div className="mt-2">轻触揭开，长按切换插旗；高级难度支持横向滚动查看完整棋盘。</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3 text-cyan-50/75">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-200/45">快捷键</div>
              <div className="mt-2">R 重新开局，1 / 2 / 3 快速切换初级、中级、高级。</div>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
