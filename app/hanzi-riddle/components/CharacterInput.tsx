import { KEYBOARD_ROWS } from '../constants/config';

interface CharacterInputProps {
    guessedChars: string[];
    disabled: boolean;
    onSelect: (char: string) => void;
}

export function CharacterInput({ guessedChars, disabled, onSelect }: CharacterInputProps) {
    return (
        <div className="w-full max-w-lg overflow-y-auto max-h-[40vh] rounded-lg bg-slate-800/30 border border-slate-700/30 p-3">
            <div className="flex flex-col gap-2">
                {KEYBOARD_ROWS.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-1.5 justify-center">
                        {row.map((char) => {
                            const isGuessed = guessedChars.includes(char);
                            return (
                                <button
                                    key={char}
                                    onClick={() => onSelect(char)}
                                    disabled={disabled || isGuessed}
                                    className={`w-9 h-9 rounded text-sm font-medium transition-all duration-200 ${
                                        isGuessed
                                            ? 'bg-slate-800/60 text-slate-600 cursor-not-allowed'
                                            : disabled
                                              ? 'bg-slate-700/40 text-slate-500 cursor-not-allowed'
                                              : 'bg-slate-700/60 text-slate-200 hover:bg-amber-600/60 hover:text-white active:scale-95'
                                    }`}
                                >
                                    {char}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
