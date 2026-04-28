'use client';

/**
 * 游戏页面通用布局组件
 *
 * 提供所有游戏页面的统一外壳：
 * - 左上角返回首页链接
 * - 页面标题
 * - 子内容容器
 *
 * @module lib/components/GameLayout
 */

import Link from 'next/link';

interface GameLayoutProps {
  /** 页面标题 */
  title: string;
  /** 背景样式 class */
  className?: string;
  children: React.ReactNode;
}

export function GameLayout({ title, className = '', children }: GameLayoutProps) {
  return (
    <main className={`min-h-screen ${className}`}>
      {/* 顶部导航 */}
      <div className="absolute top-4 left-4 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                     bg-white/10 hover:bg-white/20 backdrop-blur-sm
                     text-white/70 hover:text-white text-sm font-medium
                     transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </Link>
      </div>

      {/* 标题（屏幕阅读器可见，视觉层由各游戏自定义） */}
      <h1 className="sr-only">{title}</h1>

      {children}
    </main>
  );
}
