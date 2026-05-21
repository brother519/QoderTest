'use client';

/**
 * 游戏结束弹窗组件
 *
 * @module app/match-three/components/GameOverModal
 */

interface GameOverModalProps {
  visible: boolean;
  won: boolean;
  score: number;
  targetScore: number;
  onRestart: () => void;
  onBack: () => void;
}

export function GameOverModal({
  visible,
  won,
  score,
  targetScore,
  onRestart,
  onBack,
}: GameOverModalProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={`
          mx-4 p-8 rounded-3xl
          backdrop-blur-md border
          max-w-sm w-full text-center
          animate-[scaleIn_0.3s_ease-out]
          ${won
            ? 'bg-emerald-900/80 border-emerald-400/30 shadow-xl shadow-emerald-500/20'
            : 'bg-red-900/80 border-red-400/30 shadow-xl shadow-red-500/20'
          }
        `}
      >
        {/* 图标 */}
        <div className="text-6xl mb-4">{won ? '🎉' : '💪'}</div>

        {/* 标题 */}
        <h2
          className={`text-2xl font-bold mb-2 ${
            won ? 'text-emerald-300' : 'text-red-300'
          }`}
        >
          {won ? '恭喜通关！' : '再接再厉！'}
        </h2>

        {/* 描述 */}
        <p className="text-white/60 text-sm mb-6">
          {won
            ? '你成功达到了目标分数！'
            : '步数用完了，下次一定能行！'}
        </p>

        {/* 得分展示 */}
        <div className="mb-6 p-4 rounded-xl bg-black/20">
          <div className="text-white/50 text-sm mb-1">最终得分</div>
          <div
            className={`text-3xl font-bold ${
              won ? 'text-emerald-300' : 'text-red-300'
            }`}
          >
            {score}
          </div>
          <div className="text-white/40 text-xs mt-1">
            目标：{targetScore} 分
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRestart}
            className={`
              px-6 py-3 rounded-xl font-medium
              transition-all duration-200
              ${won
                ? 'bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-200 border border-emerald-500/40'
                : 'bg-red-500/30 hover:bg-red-500/40 text-red-200 border border-red-500/40'
              }
            `}
          >
            再玩一次
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl font-medium bg-white/10 hover:bg-white/20 text-white/70 transition-all duration-200 border border-white/20"
          >
            换关卡
          </button>
        </div>
      </div>
    </div>
  );
}
