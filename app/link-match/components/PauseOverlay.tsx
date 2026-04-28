/**
 * 暂停遮罩组件
 *
 * 游戏暂停时覆盖全屏，半透明毛玻璃背景居中显示"继续游戏"按钮。
 *
 * @module link-match/components/PauseOverlay
 */

'use client';

/**
 * @property onResume - "继续游戏"按钮回调
 */
interface PauseOverlayProps {
  onResume: () => void;
}

export function PauseOverlay({ onResume }: PauseOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
        <div className="text-5xl mb-4">⏸️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">游戏暂停</h2>
        <button
          onClick={onResume}
          className="py-3 px-8 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg"
        >
          ▶️ 继续游戏
        </button>
      </div>
    </div>
  );
}
