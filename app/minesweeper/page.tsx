/**
 * 扫雷游戏主页面
 *
 * @module minesweeper/page
 */

'use client';

import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { StatsPanel } from './components/StatsPanel';
import { DEFAULT_DIFFICULTY } from './constants/config';
import { useMinesweeperGame } from './hooks/useMinesweeperGame';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { formatTime } from '@/lib/utils/format';
import { useKeyboard } from '@/lib/hooks/useKeyboard';

const KEY_MAP: Record<string, string> = {
    r: 'restart', R: 'restart',
    '1': 'beginner',
    '2': 'intermediate',
    '3': 'expert',
};

export default function MinesweeperPage() {
    const game = useMinesweeperGame(DEFAULT_DIFFICULTY);

    useKeyboard(KEY_MAP, {
        onKeyDown: (action) => {
            if (action === 'restart') game.restart();
            if (action === 'beginner') game.changeDifficulty('beginner');
            if (action === 'intermediate') game.changeDifficulty('intermediate');
            if (action === 'expert') game.changeDifficulty('expert');
        },
    });

  return (
    <GameLayout
      title="扫雷"
      className="bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_38%),linear-gradient(180deg,#03131b_0%,#08111f_45%,#111827_100%)] h-screen flex flex-col py-4 px-3"
    >
      <div className="relative max-w-7xl mx-auto w-full flex flex-col min-h-0">
        <div className="flex items-center justify-center gap-3 mb-3 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-100/70 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            经典逻辑 · 首击安全 · 长按插旗
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-[0_0_30px_rgba(34,211,238,0.16)]">
            💣 扫雷
          </h1>
        </div>

        <div className="relative z-10 flex flex-col min-h-0 gap-3">
          <Controls
            difficultyKey={game.difficultyKey}
            remainingMines={game.remainingMines}
            elapsedTime={game.elapsedTime}
            bestTime={game.bestTime}
            status={game.status}
            onChangeDifficulty={game.changeDifficulty}
            onRestart={game.restart}
          />

          <StatsPanel stats={game.stats} />

          <div className="flex-1 min-h-0 rounded-[32px] border border-cyan-400/10 bg-white/[0.03] backdrop-blur-sm px-3 py-4 md:px-5 md:py-6 shadow-[0_24px_80px_rgba(2,12,27,0.45)] overflow-hidden">
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
        </div>
      </div>
    </GameLayout>
  );
}
