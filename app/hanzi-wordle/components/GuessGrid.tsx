/**
 * GuessGrid component — renders the 6×4 tile grid for Hanzi Wordle
 *
 * @module hanzi-wordle/components/GuessGrid
 */

import { Guess, TileStatus } from '../types/game';
import { MAX_GUESSES, WORD_LENGTH } from '../constants/config';

/** Color classes for each tile status */
const TILE_COLORS: Record<TileStatus, string> = {
    correct: 'bg-emerald-600 border-emerald-500 text-white',
    present: 'bg-amber-500 border-amber-400 text-white',
    absent: 'bg-slate-700 border-slate-600 text-slate-300',
    active: 'bg-transparent border-indigo-400 text-white',
    empty: 'bg-transparent border-slate-700 text-transparent',
};

interface TileProps {
    char: string;
    status: TileStatus;
}

function Tile({ char, status }: TileProps) {
    return (
        <div
            className={`
                w-14 h-14 md:w-16 md:h-16 flex items-center justify-center
                border-2 rounded-lg text-2xl md:text-3xl font-bold
                transition-all duration-300
                ${TILE_COLORS[status]}
            `}
        >
            {char}
        </div>
    );
}

interface GuessGridProps {
    guesses: Guess[];
    currentInput: string[];
}

export function GuessGrid({ guesses, currentInput }: GuessGridProps) {
    const rows = Array.from({ length: MAX_GUESSES }, (_, rowIdx) => {
        // Submitted guess row
        if (rowIdx < guesses.length) {
            const guess = guesses[rowIdx];
            return Array.from({ length: WORD_LENGTH }, (_, colIdx) => ({
                char: guess.chars[colIdx],
                status: guess.statuses[colIdx],
            }));
        }
        // Current input row
        if (rowIdx === guesses.length) {
            return Array.from({ length: WORD_LENGTH }, (_, colIdx) => ({
                char: currentInput[colIdx] ?? '',
                status: (currentInput[colIdx] ? 'active' : 'empty') as TileStatus,
            }));
        }
        // Future empty rows
        return Array.from({ length: WORD_LENGTH }, () => ({
            char: '',
            status: 'empty' as TileStatus,
        }));
    });

    return (
        <div className="flex flex-col gap-2">
            {rows.map((row, rowIdx) => (
                <div key={rowIdx} className="flex gap-2 justify-center">
                    {row.map((tile, colIdx) => (
                        <Tile key={colIdx} char={tile.char} status={tile.status} />
                    ))}
                </div>
            ))}
        </div>
    );
}
