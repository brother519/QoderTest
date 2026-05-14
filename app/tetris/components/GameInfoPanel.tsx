/**
 * 俄罗斯方块游戏信息面板组件
 * Tetris Game Info Panel Component
 *
 * 展示游戏信息（得分、等级、消行数、最高分）和操作按钮，
 * 嵌入下一个方块预览组件。根据游戏状态显示不同的按钮。
 *
 * Displays game info (score, level, lines cleared, high score) and action buttons,
 * embeds the next piece preview component. Shows different buttons based on game state.
 *
 * @module tetris/components/GameInfoPanel
 */

'use client';

import { GameStatus, TetrominoType, GameConfig } from '../types/game';
import { NextPiecePreview } from './NextPiecePreview';

/**
 * GameInfoPanel 组件属性
 * GameInfoPanel component props
 */
interface GameInfoPanelProps {
  /** 当前得分 / Current score */
  score: number;
  /** 当前等级 / Current level */
  level: number;
  /** 已消除行数 / Lines cleared */
  lines: number;
  /** 历史最高分 / All-time high score */
  highScore: number;
  /** 游戏状态 / Game status */
  status: GameStatus;
  /** 下一个方块类型 / Next piece type */
  nextPiece: TetrominoType;
  /** 游戏配置 / Game configuration */
  config: GameConfig;
  /** 开始游戏回调 / Start game callback */
  onStart: () => void;
  /** 暂停/继续回调 / Pause/resume callback */
  onTogglePause: () => void;
  /** 重新开始回调 / Restart callback */
  onRestart: () => void;
}

export function GameInfoPanel({
  score,
  level,
  lines,
  highScore,
  status,
  nextPiece,
  config,
  onStart,
  onTogglePause,
  onRestart,
}: GameInfoPanelProps) {
  return (
    <div className="flex flex-col gap-4 w-44">
      {/* 下一个方块预览 / Next piece preview */}
      <div className="bg-[#16213e] border border-cyan-400/30 rounded-lg p-3">
        <h3 className="text-cyan-400 text-sm font-bold mb-2 text-center">
          下一个
        </h3>
        <NextPiecePreview pieceType={nextPiece} config={config} />
      </div>

      {/* 游戏信息 / Game info */}
      <div className="bg-[#16213e] border border-cyan-400/30 rounded-lg p-3 space-y-2">
        <div className="text-gray-300 text-sm">
          得分: <strong className="text-white">{score}</strong>
        </div>
        <div className="text-gray-300 text-sm">
          等级: <strong className="text-white">{level}</strong>
        </div>
        <div className="text-gray-300 text-sm">
          行数: <strong className="text-white">{lines}</strong>
        </div>
        <div className="text-gray-300 text-sm">
          最高分: <strong className="text-cyan-400">{highScore}</strong>
        </div>
      </div>

      {/* 按钮区域 / Button area */}
      <div className="flex flex-col gap-2">
        {status === 'idle' && (
          <button
            onClick={onStart}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-[#1a1a2e] rounded-lg font-bold transition-colors"
          >
            开始游戏
          </button>
        )}

        {status === 'playing' && (
          <button
            onClick={onTogglePause}
            className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-[#1a1a2e] rounded-lg font-bold transition-colors"
          >
            暂停
          </button>
        )}

        {status === 'paused' && (
          <>
            <button
              onClick={onTogglePause}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-[#1a1a2e] rounded-lg font-bold transition-colors"
            >
              继续
            </button>
            <button
              onClick={onRestart}
              className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-[#1a1a2e] rounded-lg font-bold transition-colors"
            >
              重新开始
            </button>
          </>
        )}

        {status === 'over' && (
          <button
            onClick={onRestart}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-[#1a1a2e] rounded-lg font-bold transition-colors"
          >
            重新开始
          </button>
        )}
      </div>
    </div>
  );
}
