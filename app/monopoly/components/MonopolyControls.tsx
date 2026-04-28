'use client';

/**
 * 大富翁控制面板组件
 * 根据 phase 条件渲染对应 UI
 */

import { useState } from 'react';
import { MonopolyGameState, Player, BoardCell, PropertyState } from '../types/game';
import { BOARD_CELLS, PLAYER_COLORS, JAIL_BAIL } from '../constants/config';

interface MonopolyControlsProps {
  state: MonopolyGameState;
  currentPlayer: Player;
  onRollDice: () => void;
  onBuyProperty: () => void;
  onSkipBuy: () => void;
  onUpgradeProperty: (cellIndex: number) => void;
  onConfirm: () => void;
  onPayBail: () => void;
}

/**
 * 骰子显示组件
 */
function DiceDisplay({ dice }: { dice: { die1: number; die2: number } | null }) {
  if (!dice) return null;

  const dots: Record<number, string> = {
    1: '⚀',
    2: '⚁',
    3: '⚂',
    4: '⚃',
    5: '⚄',
    6: '⚅',
  };

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="flex items-center gap-4 justify-center">
        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-4xl shadow-lg">
          {dots[dice.die1]}
        </div>
        <span className="text-2xl text-gray-400">+</span>
        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-4xl shadow-lg">
          {dots[dice.die2]}
        </div>
      </div>
      <div className="flex items-center gap-2 text-lg">
        <span className="text-gray-300">🎲 {dice.die1} + {dice.die2} = </span>
        <span className="text-yellow-400 font-bold text-xl">{dice.die1 + dice.die2}</span>
        {dice.die1 === dice.die2 && (
          <span className="text-yellow-400 font-bold animate-pulse ml-2">双数！</span>
        )}
      </div>
    </div>
  );
}

/**
 * 玩家信息条
 */
function PlayerInfo({ player }: { player: Player }) {
  const colorConfig = PLAYER_COLORS[player.color];

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center text-lg
          ${colorConfig.bg} shadow-lg
        `}
      >
        {colorConfig.token}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-200">{player.name}</span>
          <span className="font-mono text-xl text-yellow-400">
            ${player.money.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>位置: {BOARD_CELLS[player.position]?.name || '起点'}</span>
          {player.inJail && (
            <span className="text-orange-400 font-medium">
              坐牢中 (第 {player.jailTurns + 1} 回合)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 可折叠的玩家资产面板
 */
function PlayerAssetsPanel({
  players,
  properties,
}: {
  players: Player[];
  properties: Record<number, PropertyState>;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
      {/* 标题栏 - 可点击折叠 */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-800 hover:bg-gray-700 transition-colors"
      >
        <span className="text-sm font-medium text-gray-300">📊 玩家资产</span>
        <span className="text-xs text-gray-500">{collapsed ? '▶ 展开' : '▼ 收起'}</span>
      </button>

      {/* 内容区 - 可滚动 */}
      {!collapsed && (
        <div className="max-h-52 overflow-y-auto divide-y divide-gray-800">
          {players.map((player) => {
            const ownedProps = Object.values(properties).filter(
              (p) => p.ownerId === player.id
            );
            const totalValue = ownedProps.reduce((sum, p) => {
              const cell = BOARD_CELLS[p.cellIndex];
              return sum + (cell.price ?? 0) + p.houseLevel * (cell.upgradeCost ?? 0);
            }, 0);

            return (
              <div
                key={player.id}
                className={`flex items-center gap-2 px-4 py-2 ${
                  player.bankrupt ? 'opacity-40' : ''
                }`}
              >
                <span className="text-base">{PLAYER_COLORS[player.color].token}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-200 truncate">{player.name}</span>
                    <span
                      className={`text-sm font-mono ${
                        player.bankrupt ? 'text-red-400' : 'text-yellow-400'
                      }`}
                    >
                      {player.bankrupt ? '破产' : `$${player.money.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{ownedProps.length} 处地产</span>
                    {totalValue > 0 && <span>| 价值 ${totalValue.toLocaleString()}</span>}
                    {player.inJail && (
                      <span className="text-orange-400 font-medium">坐牢中</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * 地产信息卡片
 */
function PropertyCard({ cell, property }: { cell: BoardCell; property?: { houseLevel: number } }) {
  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        {cell.group && (
          <div
            className={`w-4 h-4 rounded ${
              cell.group === 'brown'
                ? 'bg-yellow-900'
                : cell.group === 'light-blue'
                ? 'bg-sky-400'
                : cell.group === 'pink'
                ? 'bg-pink-500'
                : cell.group === 'orange'
                ? 'bg-orange-500'
                : cell.group === 'red'
                ? 'bg-red-500'
                : cell.group === 'yellow'
                ? 'bg-yellow-400'
                : cell.group === 'green'
                ? 'bg-green-500'
                : cell.group === 'blue'
                ? 'bg-blue-600'
                : 'bg-gray-500'
            }`}
          />
        )}
        <span className="font-medium text-gray-200">{cell.name}</span>
      </div>

      {cell.price && (
        <div className="text-lg text-yellow-400 mb-2">价格: ${cell.price}</div>
      )}

      {cell.rents && (
        <div className="space-y-1 text-sm">
          <div className="text-gray-400">租金表:</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-300">空地: ${cell.rents[0]}</div>
            <div className="text-gray-300">1栋: ${cell.rents[1]}</div>
            <div className="text-gray-300">2栋: ${cell.rents[2]}</div>
            <div className="text-gray-300">3栋: ${cell.rents[3]}</div>
          </div>
        </div>
      )}

      {cell.upgradeCost && cell.upgradeCost > 0 && (
        <div className="mt-2 text-sm text-cyan-400">
          升级费用: ${cell.upgradeCost}
        </div>
      )}

      {property && property.houseLevel > 0 && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-sm text-gray-400">当前等级:</span>
          <div className="flex gap-0.5">
            {Array.from({ length: property.houseLevel }).map((_, i) => (
              <div key={i} className="w-3 h-3 bg-green-500 rounded-sm" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 按钮组件
 */
function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  className?: string;
}) {
  const baseClasses =
    'px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = {
    primary: 'bg-cyan-600 hover:bg-cyan-500 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    success: 'bg-green-600 hover:bg-green-500 text-white',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function MonopolyControls({
  state,
  currentPlayer,
  onRollDice,
  onBuyProperty,
  onSkipBuy,
  onUpgradeProperty,
  onConfirm,
  onPayBail,
}: MonopolyControlsProps) {
  const { phase, lastDice, message, players, properties } = state;
  const currentCell = BOARD_CELLS[currentPlayer.position];
  const currentProperty = properties[currentPlayer.position];

  return (
    <div className="w-full max-w-md space-y-4">
      {/* 当前玩家信息 */}
      <PlayerInfo player={currentPlayer} />

      {/* 骰子结果 */}
      {lastDice && <DiceDisplay dice={lastDice} />}

      {/* 消息提示 */}
      {message && (
        <div className="p-3 bg-gray-800/80 rounded-lg text-sm text-gray-300 border-l-4 border-cyan-500">
          {message}
        </div>
      )}

      {/* 阶段控制区 */}
      <div className="p-4 bg-gray-900 rounded-xl border border-gray-700">
        {/* waiting 阶段：掷骰子 */}
        {phase === 'waiting' && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-200">等待操作</h3>
            <div className="flex gap-2">
              <Button onClick={onRollDice} variant="primary" className="flex-1">
                🎲 掷骰子
              </Button>
              {currentPlayer.inJail && (
                <Button
                  onClick={onPayBail}
                  variant="secondary"
                  disabled={currentPlayer.money < JAIL_BAIL}
                >
                  💰 缴保释金 (${JAIL_BAIL})
                </Button>
              )}
            </div>
            {currentPlayer.inJail && (
              <p className="text-xs text-gray-400">
                掷出双数即可免费出狱，或缴纳 ${JAIL_BAIL} 保释金
              </p>
            )}
          </div>
        )}

        {/* buying 阶段：购买地产 */}
        {phase === 'buying' && currentCell && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-200">购买地产</h3>
            <PropertyCard cell={currentCell} />
            <div className="flex gap-2">
              <Button
                onClick={onBuyProperty}
                variant="success"
                disabled={!currentCell.price || currentPlayer.money < currentCell.price}
              >
                ✅ 购买 (${currentCell.price})
              </Button>
              <Button onClick={onSkipBuy} variant="secondary">
                ❌ 放弃
              </Button>
            </div>
          </div>
        )}

        {/* upgrading 阶段：升级地产 */}
        {phase === 'upgrading' && currentCell && currentProperty && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-200">升级地产</h3>
            <PropertyCard cell={currentCell} property={currentProperty} />
            <div className="flex gap-2">
              {currentProperty.houseLevel < 3 && (
                <Button
                  onClick={() => onUpgradeProperty(currentPlayer.position)}
                  variant="success"
                  disabled={
                    !currentCell.upgradeCost ||
                    currentPlayer.money < currentCell.upgradeCost
                  }
                >
                  🏠 升级 (${currentCell.upgradeCost})
                </Button>
              )}
              <Button onClick={onSkipBuy} variant="secondary">
                ⏭️ 跳过
              </Button>
            </div>
            {currentProperty.houseLevel >= 3 && (
              <p className="text-sm text-gray-400">该地产已达最高等级！</p>
            )}
          </div>
        )}

        {/* chance 阶段：机会/命运卡 */}
        {phase === 'chance' && state.currentCard && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-200">
              {state.currentCard.id.startsWith('com') ? '📦 命运卡' : '✨ 机会卡'}
            </h3>
            <div className="p-4 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg border border-purple-500/30">
              <p className="text-lg text-center text-gray-100">
                {state.currentCard.text}
              </p>
            </div>
            <Button onClick={onConfirm} variant="primary" className="w-full">
              ✅ 确认
            </Button>
          </div>
        )}

        {/* jailed 阶段：入狱提示 */}
        {phase === 'jailed' && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-red-400">⚠️ 入狱</h3>
            <p className="text-gray-300">你已被送进监狱！</p>
            <p className="text-sm text-gray-400">
              下回合掷出双数可出狱，或缴纳 ${JAIL_BAIL} 保释金。
            </p>
          </div>
        )}
      </div>

      {/* 所有玩家资产 - 可折叠 */}
      <PlayerAssetsPanel players={players} properties={properties} />
    </div>
  );
}
