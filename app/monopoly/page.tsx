'use client';

/**
 * 大富翁游戏页面
 */

import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { useMonopoly } from './hooks/useMonopoly';
import { MonopolyBoard } from './components/MonopolyBoard';
import { MonopolyControls } from './components/MonopolyControls';
import { PLAYER_COLORS } from './constants/config';

export default function MonopolyPage() {
  const {
    state,
    currentPlayer,
    startGame,
    restartGame,
    rollDice,
    buyProperty,
    skipBuy,
    upgradeProperty,
    confirm,
    payBail,
  } = useMonopoly();

  const isIdle = state.status === 'idle';
  const isWon = state.status === 'won';

  return (
    <GameLayout
      title="大富翁"
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
    >
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        {/* 空闲状态：选择玩家数 */}
        {isIdle && (
          <div className="text-center space-y-8">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent mb-2">
                大富翁
              </h1>
              <p className="text-gray-400">Monopoly - 经典策略棋盘游戏</p>
            </div>

            <div className="space-y-4">
              <p className="text-lg text-gray-300">选择玩家数量</p>
              <div className="flex gap-4 justify-center">
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    onClick={() => startGame(count)}
                    className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700
                               rounded-xl text-xl font-medium text-gray-200
                               transition-all duration-200 hover:scale-105
                               hover:shadow-lg hover:shadow-yellow-500/10"
                  >
                    {count} 人
                  </button>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-500 max-w-md mx-auto">
              <p>游戏规则：</p>
              <ul className="mt-2 space-y-1 text-left list-disc list-inside">
                <li>轮流掷骰子，按点数移动棋子</li>
                <li>经过起点获得 $200 工资</li>
                <li>购买地产，对手停留时收取租金</li>
                <li>升级地产提高租金收入</li>
                <li>连续三次双数或落在"去监狱"格会被送进监狱</li>
                <li>让对手破产即可获胜！</li>
              </ul>
            </div>
          </div>
        )}

        {/* 游戏进行状态 */}
        {!isIdle && (
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* 棋盘 */}
            <MonopolyBoard
              state={state}
              currentPlayer={currentPlayer}
              onUpgradeProperty={upgradeProperty}
            />

            {/* 控制面板 */}
            <MonopolyControls
              state={state}
              currentPlayer={currentPlayer}
              onRollDice={rollDice}
              onBuyProperty={buyProperty}
              onSkipBuy={skipBuy}
              onUpgradeProperty={upgradeProperty}
              onConfirm={confirm}
              onPayBail={payBail}
            />
          </div>
        )}

        {/* 胜利弹窗 */}
        <GameOverlay visible={isWon} bgClass="bg-black/70">
          <span className="text-yellow-400 text-2xl font-bold">🎉 游戏结束！</span>
          <span className="text-white text-lg">
            {state.winnerId
              ? `${state.players.find((p) => p.id === state.winnerId)?.name} 获胜！`
              : '游戏结束！'}
          </span>
          <span className="text-cyan-400 text-lg">
            最终资产: ${state.players.find((p) => p.id === state.winnerId)?.money ?? 0}
          </span>
          <div className="flex gap-3 mt-2">
            <button
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium"
              onClick={restartGame}
            >
              再来一局
            </button>
            <a
              href="/"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium"
            >
              返回首页
            </a>
          </div>
        </GameOverlay>
      </div>
    </GameLayout>
  );
}
