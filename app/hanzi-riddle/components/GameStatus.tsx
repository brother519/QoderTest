import { RiddleGameStatus } from '../types/game';

interface GameStatusProps {
    roundStatus: RiddleGameStatus;
    wrongGuesses: number;
    targetChar: string;
    lastRoundPoints: number;
    onNext: () => void;
}

export function GameStatus({
    roundStatus,
    wrongGuesses,
    targetChar,
    lastRoundPoints,
    onNext,
}: GameStatusProps) {
    if (roundStatus === 'playing') {
        return (
            <div className="w-full max-w-md mb-4 text-center">
                <p className="text-slate-500 text-sm">
                    已猜 {wrongGuesses} / 5 次
                </p>
            </div>
        );
    }

    const won = roundStatus === 'won';

    return (
        <div className="w-full max-w-md mb-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 text-center">
                <div className="text-4xl mb-3">{won ? '🎉' : '😔'}</div>

                <h2
                    className={`text-xl font-bold mb-2 ${won ? 'text-amber-400' : 'text-slate-300'}`}
                >
                    {won ? '猜对了！' : '没猜出来'}
                </h2>

                <p className="text-slate-400 mb-1">
                    答案是
                    <span className="text-2xl font-bold text-white mx-2">「{targetChar}」</span>
                </p>

                {won && lastRoundPoints > 0 && (
                    <p className="text-amber-300 text-sm mb-4">+{lastRoundPoints} 分</p>
                )}

                <button
                    onClick={onNext}
                    className="mt-3 px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg font-medium transition-all active:scale-95"
                >
                    {won ? '下一轮' : '继续'}
                </button>
            </div>
        </div>
    );
}
