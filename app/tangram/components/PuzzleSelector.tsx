import React from 'react';
import { PuzzleDef } from '../types/game';
import { PUZZLES } from '../constants/puzzles';

interface PuzzleSelectorProps {
    currentPuzzle: PuzzleDef;
    onSelect: (puzzle: PuzzleDef) => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
    '简单': 'text-green-400',
    '中等': 'text-yellow-400',
    '困难': 'text-red-400',
};

export const PuzzleSelector: React.FC<PuzzleSelectorProps> = ({ currentPuzzle, onSelect }) => {
    return (
        <div className="grid grid-cols-3 gap-2 w-full max-w-md">
            {PUZZLES.map((puzzle) => {
                const isActive = puzzle.id === currentPuzzle.id;
                return (
                    <button
                        key={puzzle.id}
                        onClick={() => onSelect(puzzle)}
                        className={`
                            flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl
                            transition-all duration-200 text-sm
                            ${
                                isActive
                                    ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-100 shadow-lg shadow-cyan-500/10'
                                    : 'bg-slate-800/60 border-2 border-slate-700/50 text-slate-300 hover:border-slate-600 hover:bg-slate-700/60'
                            }
                        `}
                    >
                        <span className="text-xl">{puzzle.icon}</span>
                        <span className="font-medium">{puzzle.name}</span>
                        <span className={`text-xs ${DIFFICULTY_COLORS[puzzle.difficulty]}`}>
                            {puzzle.difficulty}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};
