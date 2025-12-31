import React from 'react';
import { useGameState } from '../../hooks/useGameState.js';
import { useKeyboard } from '../../hooks/useKeyboard.js';
import Board from '../Board/Board.jsx';
import ScoreBoard from '../ScoreBoard/ScoreBoard.jsx';
import Controls from '../Controls/Controls.jsx';
import styles from './Game.module.css';

const Game = () => {
  const {
    tiles,
    score,
    bestScore,
    gameStatus,
    startNewGame,
    handleMove,
    continueGame
  } = useGameState();

  useKeyboard(handleMove);

  return (
    <div className={styles.game}>
      <h1 className={styles.title}>2048</h1>
      <ScoreBoard score={score} bestScore={bestScore} />
      <Controls onNewGame={startNewGame} />
      <div className={styles.boardWrapper}>
        <Board tiles={tiles} onMove={handleMove} />
        {gameStatus === 'won' && (
          <div className={styles.overlay}>
            <div className={styles.message}>
              <h2>你赢了！</h2>
              <div className={styles.buttons}>
                <button onClick={continueGame} className={styles.continueButton}>
                  继续游戏
                </button>
                <button onClick={startNewGame} className={styles.retryButton}>
                  重新开始
                </button>
              </div>
            </div>
          </div>
        )}
        {gameStatus === 'lost' && (
          <div className={styles.overlay}>
            <div className={styles.message}>
              <h2>游戏结束</h2>
              <p>最终分数: {score}</p>
              <button onClick={startNewGame} className={styles.retryButton}>
                再试一次
              </button>
            </div>
          </div>
        )}
      </div>
      <div className={styles.instructions}>
        <p><strong>如何玩:</strong> 使用方向键或WASD键移动方块。相同数字的方块会合并！</p>
      </div>
    </div>
  );
};

export default Game;
