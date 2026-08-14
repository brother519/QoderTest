/**
 * Hanzi Wordle game page
 *
 * Main entry point for the Hanzi Wordle game.
 * Composes GuessGrid, HanziKeyboard, and GameStatusBar.
 *
 * @module hanzi-wordle/page
 */

'use client';

import { GameLayout } from '@/lib/components/GameLayout';
import { useHanziWordleGame } from './hooks/useHanziWordleGame';
import { GuessGrid } from './components/GuessGrid';
import { HanziKeyboard } from './components/HanziKeyboard';
import { GameStatusBar } from './components/GameStatus';

export default function HanziWordlePage() {
    const {
        answer,
        guesses,
        currentInput,
        gameStatus,
        keyStatuses,
        addChar,
        removeChar,
        submitGuess,
        resetGame,
    } = useHanziWordleGame();

    const isGameOver = gameStatus !== 'playing';

    return (
        <GameLayout
            title="汉字连连猜"
            className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white"
        >
            <div className="flex flex-col items-center min-h-screen pt-16 pb-6 px-4">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        🀄 汉字连连猜
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        6次机会猜出隐藏的4字成语
                    </p>

                    {/* Color legend */}
                    <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-5 h-5 rounded bg-emerald-600" />
                            位置正确
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-5 h-5 rounded bg-amber-500" />
                            字存在但位置错
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-5 h-5 rounded bg-slate-700" />
                            不在词语中
                        </span>
                    </div>
                </div>

                {/* Guess grid */}
                <div className="mb-4">
                    <GuessGrid guesses={guesses} currentInput={currentInput} />
                </div>

                {/* Status bar */}
                <div className="mb-4 w-full max-w-md">
                    <GameStatusBar
                        gameStatus={gameStatus}
                        guessCount={guesses.length}
                        answer={answer}
                        onReset={resetGame}
                    />
                </div>

                {/* Virtual keyboard */}
                <div className="w-full overflow-y-auto">
                    <HanziKeyboard
                        keyStatuses={keyStatuses}
                        onChar={addChar}
                        onDelete={removeChar}
                        onEnter={submitGuess}
                        disabled={isGameOver}
                    />
                </div>
            </div>
        </GameLayout>
    );
}
