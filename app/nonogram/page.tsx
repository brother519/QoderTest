'use client';

import { GameLayout } from '@/lib/components/GameLayout';
import { GameOverlay } from '@/lib/components/GameOverlay';
import { GamePageHeader } from '@/lib/components/GamePageHeader';
import { ControlHints } from '@/lib/components/ControlHints';
import { useNonogramGame } from './hooks/useNonogramGame';
import { NonogramGrid } from './components/NonogramGrid';
import { NonogramClues } from './components/NonogramClues';
import { NonogramControls } from './components/NonogramControls';
import { DIFFICULTY_CONFIG } from './constants/config';

export default function NonogramPage(): React.JSX.Element {
    const game = useNonogramGame();
    const cellSize = DIFFICULTY_CONFIG[game.difficulty].cellSize;

    return (
        <GameLayout
            title="数织"
            className="bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 flex flex-col items-center py-6 px-4"
        >
            <GamePageHeader
                title="数织"
                icon="🧩"
                colorClass="text-purple-400"
                subtitle="根据数字提示，填出隐藏的像素画"
            />

            <NonogramControls
                status={game.status}
                difficulty={game.difficulty}
                timer={game.timer}
                errors={game.errors}
                highScore={game.highScore}
                puzzleName={game.puzzleName}
                onStart={game.start}
                onRestart={game.restart}
                onNextPuzzle={game.nextPuzzle}
                onChangeDifficulty={game.changeDifficulty}
            />

            {game.status !== 'idle' && (
                <div className="mt-4 relative">
                    <NonogramClues
                        rowClues={game.rowClues}
                        colClues={game.colClues}
                        cellSize={cellSize}
                        isRowComplete={game.isRowComplete}
                        isColComplete={game.isColComplete}
                    />

                    <div
                        className="absolute"
                        style={{
                            top: Math.max(...game.colClues.map((c) => c.length), 1) * 20,
                            left: Math.max(...game.rowClues.map((c) => c.length), 1) * 24,
                        }}
                    >
                        <NonogramGrid
                            grid={game.grid}
                            cellSize={cellSize}
                            onCellClick={game.toggleCell}
                            onCellRightClick={game.markCell}
                        />
                    </div>

                    {/* Spacer to keep container height */}
                    <div
                        style={{
                            width:
                                Math.max(...game.rowClues.map((c) => c.length), 1) * 24 +
                                game.grid.length * cellSize,
                            height:
                                Math.max(...game.colClues.map((c) => c.length), 1) * 20 +
                                game.grid.length * cellSize,
                        }}
                    />

                    <GameOverlay visible={game.status === 'won'} bgClass="bg-slate-900/90">
                        <div className="text-purple-300 text-3xl font-bold drop-shadow-lg">
                            🎉 完成！
                        </div>
                        <div className="text-white/80 text-sm">
                            用时 {Math.floor(game.timer / 60)} 分 {game.timer % 60} 秒
                            {game.errors > 0 && ` · ${game.errors} 次错误`}
                        </div>
                        <button
                            onClick={game.nextPuzzle}
                            className="mt-2 px-6 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg font-medium transition-all"
                        >
                            下一题
                        </button>
                    </GameOverlay>
                </div>
            )}

            <ControlHints
                hints={['左键 填充', '右键 标记空格', 'R 重置']}
                className="text-slate-500 text-xs mt-4"
            />
        </GameLayout>
    );
}
