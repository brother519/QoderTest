import { ClueState } from '../types/game';

interface CluePanelProps {
    clues: ClueState[];
}

const CLUE_ICONS: Record<string, string> = {
    radical: '部',
    strokeCount: '画',
    meaningHint: '义',
    pinyinInitial: '首',
    fullPinyin: '拼',
};

export function CluePanel({ clues }: CluePanelProps) {
    return (
        <div className="w-full max-w-md mb-6">
            <div className="flex flex-col gap-3">
                {clues.map((clue, index) => (
                    <div
                        key={clue.type}
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-500 ${
                            clue.revealed
                                ? 'bg-amber-900/40 border border-amber-700/50'
                                : 'bg-slate-800/40 border border-slate-700/30'
                        }`}
                    >
                        <span
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                clue.revealed
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-slate-700 text-slate-400'
                            }`}
                        >
                            {index + 1}
                        </span>

                        <span className="text-xs text-slate-400 w-16 flex-shrink-0">
                            {clue.label}
                        </span>

                        <span
                            className={`flex-1 font-medium transition-all duration-500 ${
                                clue.revealed
                                    ? 'text-amber-200 opacity-100'
                                    : 'text-slate-600 opacity-50'
                            }`}
                        >
                            {clue.revealed ? clue.value : `🔒 ${CLUE_ICONS[clue.type] ?? '?'}`}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
