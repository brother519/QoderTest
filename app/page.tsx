/**
 * 游戏中心首页
 *
 * 展示所有可用游戏的入口卡片，点击跳转到对应游戏页面。
 * 游戏列表来自 lib/registry.ts，添加新游戏只需更新注册表。
 *
 * @module app/page
 */

import Link from 'next/link';
import { GAME_REGISTRY } from '@/lib/registry';

/** 背景装饰球配置 */
const DECORATIONS = [
  { size: 'w-72 h-72', color: 'bg-purple-600/10', position: 'top-[-5%] left-[-8%]', animation: 'animate-float' },
  { size: 'w-96 h-96', color: 'bg-blue-600/8', position: 'top-[20%] right-[-12%]', animation: 'animate-float-reverse' },
  { size: 'w-64 h-64', color: 'bg-emerald-600/8', position: 'bottom-[10%] left-[5%]', animation: 'animate-float-slow' },
  { size: 'w-48 h-48', color: 'bg-indigo-600/10', position: 'bottom-[-5%] right-[15%]', animation: 'animate-float' },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#1a1a3e] to-[#24243e] overflow-hidden">
      {/* 背景装饰 - 模糊光球 */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {DECORATIONS.map((deco, i) => (
          <div
            key={i}
            className={`absolute ${deco.size} ${deco.color} ${deco.position} ${deco.animation} rounded-full blur-3xl`}
          />
        ))}
        {/* 网格纹理叠加 */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* 主内容 */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-16">
        {/* 标题区域 */}
        <div className="text-center mb-10 md:mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-sm mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {GAME_REGISTRY.length} 款游戏已就绪
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent animate-title-shimmer">
              游戏中心
            </span>
          </h1>

          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            选择一款游戏，开启你的休闲时光
          </p>
        </div>

        {/* 游戏卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {GAME_REGISTRY.map((game, index) => (
            <Link
              key={game.id}
              href={`/${game.id}`}
              className={`group block animate-slide-up-delay-${index + 1}`}
            >
              <div
                className={`game-card neon-border relative bg-white/[0.08] backdrop-blur-md border border-white/[0.15] rounded-2xl p-4 md:p-5 h-full flex flex-col ${game.glowColor} hover:shadow-2xl`}
              >
                {/* 卡片顶部渐变光条 */}
                <div
                  className={`absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r ${game.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full`}
                />

                {/* 图标容器 */}
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${game.iconBg} border border-white/[0.08] flex items-center justify-center text-2xl md:text-3xl mb-3 md:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  {game.icon}
                </div>

                {/* 游戏名称 */}
                <h2 className={`text-lg md:text-xl font-bold mb-2 bg-gradient-to-r ${game.gradient} bg-clip-text text-transparent`}>
                  {game.name}
                </h2>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {game.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-[10px] md:text-xs font-medium text-gray-400 bg-white/[0.06] border border-white/[0.06] rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 游戏描述 */}
                <p className="text-gray-400/90 text-xs md:text-sm leading-relaxed flex-1 mb-3 md:mb-4 line-clamp-2">
                  {game.description}
                </p>

                {/* 进入按钮 */}
                <div className={`flex items-center justify-between pt-3 md:pt-4 border-t border-white/[0.06]`}>
                  <span className="text-xs md:text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                    开始游戏
                  </span>
                  <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br ${game.gradient} flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}>
                    <svg
                      className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 底部装饰 */}
        <div className="mt-12 md:mt-16 text-center animate-slide-up-delay-3">
          <p className="text-gray-600 text-sm tracking-wide">
            键盘操控 &middot; 即开即玩 &middot; 休闲益智
          </p>
        </div>
      </div>
    </main>
  );
}
