/**
 * 连连看游戏主页面
 *
 * 作为 Next.js App Router 页面组件，整合三个核心 Hook：
 * - useLinkMatchGame：棋盘管理、路径匹配、卡牌选择
 * - useLinkMatchState：分数、计时、连击、提示次数
 * - useLinkMatchHint：提示高亮的显示与自动清除
 *
 * 页面结构（从上到下）：
 * 1. 标题区：游戏名称和简要说明
 * 2. 关卡选择界面（游戏开始前显示）
 * 3. 控制面板：分数、时间、连击、操作按钮
 * 4. 游戏棋盘：卡牌网格 + 连接线动画
 * 5. 游戏说明：操作提示文字
 * 6. 弹窗层：胜利弹窗 / 暂停遮罩（条件渲染）
 *
 * @module link-match/page
 */

'use client';

import { useEffect, useCallback, useState } from 'react';
import { useLinkMatchGame } from './hooks/useLinkMatchGame';
import { useLinkMatchState } from './hooks/useLinkMatchState';
import { useLinkMatchHint } from './hooks/useLinkMatchHint';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { VictoryModal } from './components/VictoryModal';
import { PauseOverlay } from './components/PauseOverlay';
import { LevelSelector } from './components/LevelSelector';
import { LEVELS, DEFAULT_LEVEL } from './constants/config';
import { Card, GameLevel } from './types/game';
import { isAllMatched } from './utils/boardLogic';
import { GameLayout } from '@/lib/components/GameLayout';

/** 连连看游戏主页面组件 */
export default function LinkMatchPage() {
  // 当前选择的关卡
  const [currentLevel, setCurrentLevel] = useState<GameLevel>(DEFAULT_LEVEL);
  // 是否已选择关卡开始游戏
  const [gameStarted, setGameStarted] = useState(false);

  // 游戏运营状态：分数、计时、连击、提示次数、生命周期控制
  const gameState = useLinkMatchState();
  // 提示高亮管理
  const { hintedCards, showHint, clearHint } = useLinkMatchHint();

  // 获取当前关卡配置
  const currentConfig = LEVELS[currentLevel].config;

  // 游戏核心逻辑：棋盘管理、路径匹配、卡牌选择
  const gameLogic = useLinkMatchGame(
    currentConfig,
    // 匹配成功回调
    useCallback(() => {
      gameState.addScore(true);
    }, [gameState]),
    // 匹配失败回调
    useCallback(() => {
      gameState.addScore(false);
    }, [gameState])
  );

  /** 胜利检测：棋盘变化时检查是否所有卡牌都已消除 */
  useEffect(() => {
    const status = gameState.status;
    const setGameWon = gameState.setGameWon;
    if (isAllMatched(gameLogic.board) && status === 'playing') {
      setGameWon();
    }
  }, [gameLogic.board, gameState.status, gameState.setGameWon]);

  /** 选择关卡 */
  const handleSelectLevel = useCallback((level: GameLevel) => {
    setCurrentLevel(level);
  }, []);

  /** 开始游戏 */
  const handleStartGame = useCallback(() => {
    setGameStarted(true);
    gameState.startGame();
  }, [gameState]);

  /** 重置游戏：清除提示、重新生成棋盘、归零状态 */
  const handleReset = useCallback(() => {
    clearHint();
    gameLogic.resetGame();
    gameState.resetState();
    setGameStarted(false);
    setCurrentLevel(DEFAULT_LEVEL);
  }, [gameLogic, gameState, clearHint]);

  /** 提示功能：消耗一次提示机会，高亮一对可消除卡牌 */
  const handleHint = useCallback(() => {
    if (!gameState.useHint()) return;

    const hintPair = gameLogic.getHint();
    if (hintPair) {
      showHint(hintPair);
    }
  }, [gameLogic, gameState, showHint]);

  /** 暂停游戏 */
  const handlePause = useCallback(() => {
    gameState.pauseGame();
  }, [gameState]);

  /** 继续游戏 */
  const handleResume = useCallback(() => {
    gameState.resumeGame();
  }, [gameState]);

  /** 卡牌选择：idle 状态首次点击自动开始游戏，playing 状态下响应选择 */
  const handleCardSelect = useCallback(
    (card: Card) => {
      if (gameState.status === 'idle') {
        gameState.startGame();
      }
      if (gameState.status === 'playing') {
        gameLogic.handleCardSelect(card);
      }
    },
    [gameLogic, gameState]
  );

  return (
    <GameLayout title="连连看" className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-8 px-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            🎮 连连看
          </h1>
          <p className="text-white/80 text-lg">
            找出相同的图案，用最少的转弯连接它们！
          </p>
        </div>

        {!gameStarted ? (
          // 关卡选择界面
          <LevelSelector
            levels={LEVELS}
            currentLevel={currentLevel}
            onSelectLevel={handleSelectLevel}
            onStart={handleStartGame}
          />
        ) : (
          // 游戏界面
          <>
            <div className="flex justify-center mb-6">
              <GameControls
                score={gameState.score}
                timeElapsed={gameState.timeElapsed}
                status={gameState.status}
                combo={gameState.combo}
                hintsRemaining={gameState.hintsRemaining}
                onReset={handleReset}
                onHint={handleHint}
                onPause={handlePause}
                onResume={handleResume}
              />
            </div>

            <div className="flex justify-center">
              <GameBoard
                board={gameLogic.board}
                selectedCards={gameLogic.selectedCards}
                connectionPath={gameLogic.connectionPath}
                hintedCards={hintedCards}
                onCardSelect={handleCardSelect}
              />
            </div>

            <div className="mt-8 text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 text-white/90 text-sm">
                <p>💡 点击两张相同的卡牌进行消除，最多可以转 2 个弯</p>
              </div>
            </div>
          </>
        )}
      </div>

      {gameState.status === 'won' && (
        <VictoryModal
          score={gameState.score}
          timeElapsed={gameState.timeElapsed}
          onReset={handleReset}
        />
      )}

      {gameState.status === 'paused' && (
        <PauseOverlay onResume={handleResume} />
      )}
    </GameLayout>
  );
}
