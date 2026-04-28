'use client';

/**
 * 大富翁棋盘组件
 * CSS Grid 8×8 布局，28格环形棋盘
 */

import { MonopolyGameState, Player, PropertyState } from '../types/game';
import { BOARD_CELLS, GROUP_COLORS, PLAYER_COLORS } from '../constants/config';

interface MonopolyBoardProps {
  state: MonopolyGameState;
  currentPlayer: Player;
  onUpgradeProperty?: (cellIndex: number) => void;
}

/**
 * 计算格子在 8×8 网格中的位置
 * 底边(0-6):  row=8, col从8到2（右→左）
 * 左边(7-13): col=1, row从8到2（下→上）
 * 顶边(14-20): row=1, col从1到7（左→右）
 * 右边(21-27): col=8, row从1到7（上→下）
 *
 * 四个角: 0→(8,8), 7→(8,1), 14→(1,1), 21→(1,8)
 */
function getCellPosition(index: number): { row: number; col: number } {
  if (index >= 0 && index <= 6) {
    // 底边：从右到左
    return { row: 8, col: 8 - index };
  } else if (index >= 7 && index <= 13) {
    // 左边：从下到上
    return { row: 15 - index, col: 1 };
  } else if (index >= 14 && index <= 20) {
    // 顶边：从左到右
    return { row: 1, col: index - 13 };
  } else {
    // 右边：从上到下
    return { row: index - 20, col: 8 };
  }
}

/**
 * 渲染单个格子
 */
function BoardCell({
  cell,
  players,
  property,
  isCurrentPlayerTurn,
  onUpgrade,
  phase,
}: {
  cell: (typeof BOARD_CELLS)[0];
  players: Player[];
  property?: PropertyState;
  isCurrentPlayerTurn: boolean;
  onUpgrade?: (cellIndex: number) => void;
  phase: string;
}) {
  const pos = getCellPosition(cell.index);

  // 获取在此格子的玩家
  const playersOnCell = players.filter((p) => p.position === cell.index && !p.bankrupt);

  // 地产颜色条
  const groupColor = cell.group ? GROUP_COLORS[cell.group] : '';

  // 是否可升级
  const canUpgrade =
    phase === 'upgrading' &&
    property?.ownerId === players.find((p) => !p.bankrupt)?.id &&
    isCurrentPlayerTurn;

  // 颜色条位置：顶边格子在底部，右边格子在左侧，底边格子在顶部，左边格子在右侧
  const colorBarPosition = cell.index >= 0 && cell.index <= 6
    ? 'top'
    : cell.index >= 7 && cell.index <= 13
      ? 'right'
      : cell.index >= 14 && cell.index <= 20
        ? 'bottom'
        : 'left';

  return (
    <div
      className={`
        relative border border-gray-600/80 bg-gray-800/90
        flex flex-col items-center justify-center
        overflow-hidden z-10
        ${canUpgrade ? 'ring-2 ring-yellow-400 cursor-pointer hover:bg-gray-700' : ''}
      `}
      style={{
        gridRow: pos.row,
        gridColumn: pos.col,
      }}
      onClick={() => canUpgrade && onUpgrade?.(cell.index)}
    >
      {/* 地产颜色条 */}
      {groupColor && colorBarPosition === 'top' && (
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${groupColor}`} />
      )}
      {groupColor && colorBarPosition === 'bottom' && (
        <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${groupColor}`} />
      )}
      {groupColor && colorBarPosition === 'left' && (
        <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${groupColor}`} />
      )}
      {groupColor && colorBarPosition === 'right' && (
        <div className={`absolute top-0 right-0 bottom-0 w-1.5 ${groupColor}`} />
      )}

      {/* 格子内容 — 始终水平可读 */}
      <div className="flex flex-col items-center justify-center text-center w-full px-1 py-0.5">
        <span className="text-[10px] text-gray-200 leading-tight font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
          {cell.name}
        </span>
        {cell.price != null && (
          <span className="text-[9px] text-yellow-400 font-mono">${cell.price}</span>
        )}
        {cell.taxAmount != null && (
          <span className="text-[9px] text-red-400 font-mono">-${cell.taxAmount}</span>
        )}
      </div>

      {/* 所有权标识 */}
      {property?.ownerId && (
        <div className="absolute bottom-0.5 left-0 right-0 flex justify-center gap-0.5">
          {Array.from({ length: property.houseLevel }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-green-400 rounded-sm" />
          ))}
          {property.houseLevel === 0 && (
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                PLAYER_COLORS[
                  players.find((p) => p.id === property.ownerId)?.color || 'cyan'
                ].bg
              }`}
            />
          )}
        </div>
      )}

      {/* 玩家棋子 */}
      {playersOnCell.length > 0 && (
        <div className="absolute -top-1 -right-1 flex -space-x-1 z-10">
          {playersOnCell.map((p) => (
            <div
              key={p.id}
              className={`
                w-4 h-4 rounded-full flex items-center justify-center
                text-[10px] border border-gray-900
                ${PLAYER_COLORS[p.color].bg}
              `}
              title={p.name}
            >
              {PLAYER_COLORS[p.color].token}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MonopolyBoard({
  state,
  currentPlayer,
  onUpgradeProperty,
}: MonopolyBoardProps) {
  const { players, properties, phase } = state;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 棋盘容器 — 8×8 CSS Grid */}
      <div
        className="grid bg-gray-900 rounded-xl shadow-2xl border border-gray-700"
        style={{
          gridTemplateColumns: 'repeat(8, 5.5rem)',
          gridTemplateRows: 'repeat(8, 4rem)',
          gap: '0px',
        }}
      >
        {/* 外圈格子 */}
        {BOARD_CELLS.map((cell) => (
          <BoardCell
            key={cell.index}
            cell={cell}
            players={players}
            property={properties[cell.index]}
            isCurrentPlayerTurn={currentPlayer.id === state.players[state.currentPlayerIndex]?.id}
            onUpgrade={onUpgradeProperty}
            phase={phase}
          />
        ))}

        {/* 中央信息区 — 占据内部 6×6 区域 (row 2-7, col 2-7) */}
        <div
          className="bg-gray-900/95 rounded-lg border border-gray-700/50 flex flex-col items-center justify-center pointer-events-none z-0"
          style={{
            gridRow: '2 / 8',
            gridColumn: '2 / 8',
          }}
        >
          {/* Logo */}
          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              大富翁
            </h2>
            <p className="text-xs text-gray-400 mt-1">Monopoly</p>
          </div>

          {/* 当前回合信息 */}
          <div className="mt-3 p-2 bg-gray-800 rounded-lg pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">当前回合:</span>
              <div
                className={`
                  w-5 h-5 rounded-full flex items-center justify-center text-xs
                  ${PLAYER_COLORS[currentPlayer.color].bg}
                `}
              >
                {PLAYER_COLORS[currentPlayer.color].token}
              </div>
              <span className="text-sm font-medium text-gray-200">
                {currentPlayer.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
