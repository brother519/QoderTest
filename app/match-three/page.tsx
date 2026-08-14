'use client';

/**
 * 消消乐游戏主页面
 *
 * 整合 useMatchThreeGame 和 useMatchThreeState Hook，
 * 管理关卡选择 → 游戏进行 → 结束弹窗的完整流程。
 * 访问路径：/match-three
 *
 * @module match-three/page
 */

import { useState, useEffect, useCallback } from 'react';

import type { GameLevel, LevelConfig } from './types/game';

import { LEVELS } from './constants/config';
import { useMatchThreeGame } from './hooks/useMatchThreeGame';
import { useMatchThreeState } from './hooks/useMatchThreeState';
import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { LevelSelector } from './components/LevelSelector';
import { GameOverModal } from './components/GameOverModal';

/** 默认配置（简单关卡），用于 hooks 初始化 */
const DEFAULT_CONFIG = LEVELS.easy;

export default function MatchThreePage() {
  /** 当前选中的关卡配置 */
  const [currentConfig, setCurrentConfig] = useState<LevelConfig>(DEFAULT_CONFIG);
  /** 是否已选择关卡（进入游戏） */
  const [levelSelected, setLevelSelected] = useState(false);

  // 游戏状态 Hook
  const gameState = useMatchThreeState(currentConfig);

  // 游戏逻辑 Hook —— 回调连接 gameState
  const game = useMatchThreeGame(
    currentConfig,
    gameState.handleMatch,
    gameState.handleMoveMade,
  );

  /** 选择关卡并开始游戏 */
  const handleSelectLevel = useCallback(
    (level: GameLevel) => {
      const config = LEVELS[level];
      setCurrentConfig(config);
      setLevelSelected(true);
      gameState.resetState(config);
      gameState.setStatus('playing');
      // 下一帧重置游戏棋盘，确保 config 已更新
      setTimeout(() => {
        game.resetGame(config);
      }, 0);
    },
    [gameState, game],
  );

  /** 监听分数变化检查胜利条件 */
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.score >= currentConfig.targetScore) {
      gameState.setStatus('won');
    }
  }, [gameState.score, gameState.status, currentConfig.targetScore]);

  /** 重新开始（同一关卡） */
  const handleRestart = useCallback(() => {
    gameState.resetState(currentConfig);
    gameState.setStatus('playing');
    game.resetGame(currentConfig);
  }, [gameState, game, currentConfig]);

  /** 暂停/继续 */
  const handlePause = useCallback(() => {
    if (gameState.status === 'playing') {
      gameState.setStatus('paused');
    } else if (gameState.status === 'paused') {
      gameState.setStatus('playing');
    }
  }, [gameState]);

  /** 返回关卡选择 */
  const handleBack = useCallback(() => {
    setLevelSelected(false);
    gameState.resetState(currentConfig);
  }, [gameState, currentConfig]);

  return (
    <GameLayout
      title="消消乐"
      className="bg-gradient-to-br from-pink-600 via-rose-500 to-orange-500 flex flex-col items-center justify-center py-8 px-4"
    >
      {!levelSelected ? (
        /* ---- 关卡选择 ---- */
        <LevelSelector onSelectLevel={handleSelectLevel} />
      ) : (
        /* ---- 游戏进行中 ---- */
        <div className="text-center pt-8">
          {/* 标题 */}
          <h1 className="text-3xl font-bold text-white mb-6">💎 消消乐</h1>

          {/* 游戏主体区域：棋盘 + 控制面板 */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center sm:items-start">
            {/* 棋盘区 */}
            <div className="relative inline-block">
              <GameBoard
                board={game.board}
                selectedGem={game.selectedGem}
                matchedPositions={game.matchedPositions}
                isAnimating={game.isAnimating}
                onGemClick={game.handleGemClick}
              />

              {/* 暂停遮罩 */}
              <GameOverlay visible={gameState.status === 'paused'}>
                <span className="text-yellow-300 text-3xl font-bold">暂停</span>
                <button
                  onClick={handlePause}
                  className="mt-2 px-6 py-2 rounded-lg bg-green-500/30 hover:bg-green-500/40 text-green-200 text-sm font-medium border border-green-500/40 transition-all duration-200"
                >
                  继续游戏
                </button>
              </GameOverlay>
            </div>

            {/* 控制面板 */}
            <GameControls
              score={gameState.score}
              targetScore={currentConfig.targetScore}
              movesLeft={gameState.movesLeft}
              status={gameState.status}
              onRestart={handleRestart}
              onPause={handlePause}
            />
          </div>

          {/* 连锁提示 */}
          {game.cascadeCount > 1 && game.isAnimating && (
            <div className="mt-4 text-lg font-bold text-yellow-300 animate-bounce">
              🔥 {game.cascadeCount} 连锁！
            </div>
          )}
        </div>
      )}

      {/* 游戏结束弹窗 */}
      <GameOverModal
        visible={gameState.status === 'won' || gameState.status === 'over'}
        won={gameState.status === 'won'}
        score={gameState.score}
        targetScore={currentConfig.targetScore}
        onRestart={handleRestart}
        onBack={handleBack}
      />
    </GameLayout>
  );
}
