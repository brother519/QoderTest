interface ScoreBoardProps {
    roundNumber: number;
    score: number;
    streak: number;
    highScore: number;
}

export function ScoreBoard({ roundNumber, score, streak, highScore }: ScoreBoardProps) {
    return (
        <div className="w-full max-w-md mb-6 grid grid-cols-4 gap-2">
            <div className="bg-slate-800/50 rounded-lg px-3 py-2 text-center">
                <div className="text-xs text-slate-400">轮次</div>
                <div className="text-lg font-bold text-slate-200">{roundNumber}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg px-3 py-2 text-center">
                <div className="text-xs text-slate-400">得分</div>
                <div className="text-lg font-bold text-amber-400">{score}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg px-3 py-2 text-center">
                <div className="text-xs text-slate-400">连胜</div>
                <div
                    className={`text-lg font-bold ${streak >= 3 ? 'text-orange-400 animate-pulse' : 'text-slate-200'}`}
                >
                    {streak}
                </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg px-3 py-2 text-center">
                <div className="text-xs text-slate-400">最高</div>
                <div className="text-lg font-bold text-amber-300">{highScore}</div>
            </div>
        </div>
    );
}
