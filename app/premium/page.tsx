'use client';

import { useState } from 'react';
import { GameLayout } from '@/lib/components/GameLayout';

interface PremiumGame {
  id: string;
  name: string;
  description: string;
  price: string;
}

const PREMIUM_GAMES: PremiumGame[] = [
  {
    id: 'monopoly',
    name: '大富翁',
    description: '经典大富翁棋盘游戏，多人对战模式',
    price: '¥9.90',
  },
  {
    id: 'tank-battle',
    name: '坦克大战',
    description: '经典坦克大战，解锁全部关卡和高级坦克',
    price: '¥9.90',
  },
  {
    id: 'aircraft-battle',
    name: '飞机大战',
    description: '弹幕射击游戏，解锁全部机型和无限续命',
    price: '¥9.90',
  },
];

export default function PremiumPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handlePurchase = async (game: PremiumGame) => {
    setLoading(game.id);
    setMessage(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id, gameName: game.name }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage(data.error || '创建支付会话失败');
      }
    } catch {
      setMessage('网络错误，请稍后重试');
    } finally {
      setLoading(null);
    }
  };

  const searchParams = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : null;
  const success = searchParams?.get('success');
  const canceled = searchParams?.get('canceled');

  return (
    <GameLayout title="高级游戏商店">
      <div className="max-w-2xl mx-auto p-6">
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800">
            购买成功！游戏已解锁，尽情享受吧。
          </div>
        )}
        {canceled && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800">
            支付已取消。如需购买可随时重新操作。
          </div>
        )}

        <p className="text-gray-600 mb-8 text-center">
          一次购买，永久解锁完整版游戏体验
        </p>

        <div className="grid gap-4">
          {PREMIUM_GAMES.map((game) => (
            <div
              key={game.id}
              className="border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:border-blue-300 transition-colors"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {game.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {game.description}
                </p>
              </div>
              <button
                onClick={() => handlePurchase(game)}
                disabled={loading === game.id}
                className="ml-4 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
              >
                {loading === game.id ? '处理中...' : game.price}
              </button>
            </div>
          ))}
        </div>

        {message && (
          <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
            {message}
          </div>
        )}

        <div className="mt-8 text-center text-xs text-gray-400">
          支付由 Stripe 安全处理 · 支持多种支付方式
        </div>
      </div>
    </GameLayout>
  );
}
