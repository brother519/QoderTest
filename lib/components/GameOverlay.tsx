'use client';

/**
 * 游戏遮罩层组件
 *
 * 在游戏画布上叠加半透明遮罩，适用于暂停、游戏结束、等待开始等场景。
 * 统一了 tetris 和 snake 中重复的遮罩 UI。
 *
 * @module lib/components/GameOverlay
 */

interface GameOverlayProps {
  /** 是否显示遮罩 */
  visible: boolean;
  /** 遮罩背景透明度 class，默认 bg-black/50 */
  bgClass?: string;
  children: React.ReactNode;
}

export function GameOverlay({
  visible,
  bgClass = 'bg-black/50',
  children,
}: GameOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={`absolute inset-0 ${bgClass} flex flex-col items-center justify-center rounded-lg gap-3`}
    >
      {children}
    </div>
  );
}
