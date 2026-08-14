import { useCallback, useState } from 'react';
import { useHighScore } from '@/lib/hooks/useHighScore';
import { ClueState, RiddleGameStatus, RoundResult, CharacterEntry } from '../types/game';
import {
    CHARACTER_DB,
    CLUE_ORDER,
    CLUE_LABELS,
    MAX_ATTEMPTS,
    SCORE_PER_CLUE,
    HIGH_SCORE_KEY,
} from '../constants/config';

function pickTarget(excludeChars: Set<string>): CharacterEntry {
    const available = CHARACTER_DB.filter((e) => !excludeChars.has(e.character));
    const pool = available.length > 0 ? available : CHARACTER_DB;
    return pool[Math.floor(Math.random() * pool.length)];
}

function buildClues(target: CharacterEntry): ClueState[] {
    return CLUE_ORDER.map((type, index) => ({
        type,
        label: CLUE_LABELS[type],
        value: String(
            type === 'radical'
                ? target.radical
                : type === 'strokeCount'
                  ? target.strokeCount
                  : type === 'meaningHint'
                    ? target.meaningHint
                    : type === 'pinyinInitial'
                      ? target.pinyinInitial
                      : target.fullPinyin,
        ),
        revealed: index === 0,
    }));
}

export interface HanziRiddleState {
    target: CharacterEntry;
    clues: ClueState[];
    wrongGuesses: number;
    guessedChars: string[];
    roundStatus: RiddleGameStatus;
    roundNumber: number;
    score: number;
    streak: number;
    roundHistory: RoundResult[];
    highScore: number;
    guessCharacter: (char: string) => void;
    nextRound: () => void;
    resetGame: () => void;
}

export function useHanziRiddleGame(): HanziRiddleState {
    const [highScore, updateHighScore] = useHighScore(HIGH_SCORE_KEY);
    const [recentChars] = useState<Set<string>>(() => new Set());

    const [target, setTarget] = useState<CharacterEntry>(() => pickTarget(new Set()));
    const [clues, setClues] = useState<ClueState[]>(() => buildClues(target));
    const [wrongGuesses, setWrongGuesses] = useState(0);
    const [guessedChars, setGuessedChars] = useState<string[]>([]);
    const [roundStatus, setRoundStatus] = useState<RiddleGameStatus>('playing');

    const [roundNumber, setRoundNumber] = useState(1);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [roundHistory, setRoundHistory] = useState<RoundResult[]>([]);

    const guessCharacter = useCallback(
        (char: string) => {
            if (roundStatus !== 'playing') return;
            if (guessedChars.includes(char)) return;

            const newGuessed = [...guessedChars, char];
            setGuessedChars(newGuessed);

            if (char === target.character) {
                const remaining = MAX_ATTEMPTS - wrongGuesses;
                const points = remaining * SCORE_PER_CLUE;
                const newScore = score + points;

                setRoundStatus('won');
                setScore(newScore);
                setStreak((prev) => prev + 1);
                updateHighScore(newScore);
                setRoundHistory((prev) => [
                    ...prev,
                    { won: true, character: target.character, cluesRemaining: remaining, points },
                ]);
                recentChars.add(target.character);
                if (recentChars.size > 15) {
                    const first = recentChars.values().next().value;
                    if (first !== undefined) recentChars.delete(first);
                }
            } else {
                const newWrong = wrongGuesses + 1;
                setWrongGuesses(newWrong);

                setClues((prev) =>
                    prev.map((c, i) => (i === newWrong ? { ...c, revealed: true } : c)),
                );

                if (newWrong >= MAX_ATTEMPTS) {
                    setRoundStatus('lost');
                    setStreak(0);
                    setRoundHistory((prev) => [
                        ...prev,
                        { won: false, character: target.character, cluesRemaining: 0, points: 0 },
                    ]);
                    recentChars.add(target.character);
                    if (recentChars.size > 15) {
                        const first = recentChars.values().next().value;
                        if (first !== undefined) recentChars.delete(first);
                    }
                }
            }
        },
        [roundStatus, guessedChars, target, wrongGuesses, score, updateHighScore, recentChars],
    );

    const nextRound = useCallback(() => {
        const newTarget = pickTarget(recentChars);
        setTarget(newTarget);
        setClues(buildClues(newTarget));
        setWrongGuesses(0);
        setGuessedChars([]);
        setRoundStatus('playing');
        setRoundNumber((prev) => prev + 1);
    }, [recentChars]);

    const resetGame = useCallback(() => {
        recentChars.clear();
        const newTarget = pickTarget(new Set());
        setTarget(newTarget);
        setClues(buildClues(newTarget));
        setWrongGuesses(0);
        setGuessedChars([]);
        setRoundStatus('playing');
        setRoundNumber(1);
        setScore(0);
        setStreak(0);
        setRoundHistory([]);
    }, [recentChars]);

    return {
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
    };
}
