'use client';

import { GameLayout } from '@/lib/components/GameLayout';
import { useHanziRiddleGame } from './hooks/useHanziRiddleGame';
import { CluePanel } from './components/CluePanel';
import { CharacterInput } from './components/CharacterInput';
import { ScoreBoard } from './components/ScoreBoard';
import { GameStatus } from './components/GameStatus';

export default function HanziRiddlePage() {
    const {
        target,
        clues,
        wrongGuesses,
        guessedChars,
        roundStatus,
        roundNumber,
        score,
        streak,
        roundHistory,
        highScore,
        guessCharacter,
        nextRound,
        resetGame,
    } = useHanziRiddleGame();

    const isRoundOver = roundStatus !== 'playing';
    const lastPoints =
        roundHistory.length > 0 ? roundHistory[roundHistory.length - 1].points : 0;

    return (
        <GameLayout
            title="汉字猜谜"
            className="bg-gradient-to-br from-slate-950 via-amber-950 to-slate-900 text-white"
        >
            <div className="flex flex-col items-center min-h-screen pt-16 pb-6 px-4">
                <div className="text-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        🏮 汉字猜谜
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        开局提示偏旁部首，猜错逐步揭示更多线索，线索越少分数越高
                    </p>
                </div>

                <ScoreBoard
                    roundNumber={roundNumber}
                    score={score}
                    streak={streak}
                    highScore={highScore}
                />

                <CluePanel clues={clues} />

                <GameStatus
                    roundStatus={roundStatus}
                    wrongGuesses={wrongGuesses}
                    targetChar={target.character}
                    lastRoundPoints={lastPoints}
                    onNext={nextRound}
                />

                <CharacterInput
                    guessedChars={guessedChars}
                    disabled={isRoundOver}
                    onSelect={guessCharacter}
                />

                <button
                    onClick={resetGame}
                    className="mt-4 text-slate-500 text-xs hover:text-slate-300 transition-colors"
                >
                    重新开始
                </button>
            </div>
        </GameLayout>
    );
}
