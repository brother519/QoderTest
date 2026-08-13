/**
 * Core game logic hook for Hanzi Wordle
 *
 * Manages game state including the answer, submitted guesses,
 * current input buffer, game status, and keyboard character statuses.
 *
 * @module hanzi-wordle/hooks/useHanziWordle
 */

import { useCallback, useState } from 'react';
import { Guess, GameStatus, KeyStatusMap, TileStatus } from '../types/game';
import { WORD_LIST, WORD_LENGTH, MAX_GUESSES } from '../constants/config';

/** Pick a random word from the word list */
function pickWord(): string {
    return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
}

/**
 * Evaluate a guess against the answer and return per-character statuses.
 *
 * Algorithm:
 * 1. First pass: mark exact matches as 'correct'.
 * 2. Second pass: mark characters that exist in the answer (at other positions)
 *    as 'present', being careful not to over-count duplicate characters.
 */
function evaluateGuess(guess: string[], answer: string[]): TileStatus[] {
    const statuses: TileStatus[] = new Array(WORD_LENGTH).fill('absent');
    const remainingAnswer = [...answer];

    // First pass — correct positions
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guess[i] === answer[i]) {
            statuses[i] = 'correct';
            remainingAnswer[i] = ''; // consumed
        }
    }

    // Second pass — present but wrong position
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (statuses[i] === 'correct') continue;
        const idx = remainingAnswer.indexOf(guess[i]);
        if (idx !== -1) {
            statuses[i] = 'present';
            remainingAnswer[idx] = ''; // consumed
        }
    }

    return statuses;
}

/** Status priority order for merging into keyStatusMap */
const STATUS_PRIORITY: Record<TileStatus, number> = {
    correct: 3,
    present: 2,
    absent: 1,
    active: 0,
    empty: 0,
};

export interface HanziWordleState {
    answer: string;
    guesses: Guess[];
    currentInput: string[];
    gameStatus: GameStatus;
    keyStatuses: KeyStatusMap;
    addChar: (char: string) => void;
    removeChar: () => void;
    submitGuess: () => void;
    resetGame: () => void;
}

export function useHanziWordle(): HanziWordleState {
    const [answer, setAnswer] = useState<string>(() => pickWord());
    const [guesses, setGuesses] = useState<Guess[]>([]);
    const [currentInput, setCurrentInput] = useState<string[]>([]);
    const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
    const [keyStatuses, setKeyStatuses] = useState<KeyStatusMap>({});

    /** Add a character to the current input buffer (max WORD_LENGTH) */
    const addChar = useCallback(
        (char: string) => {
            if (gameStatus !== 'playing') return;
            if (currentInput.length >= WORD_LENGTH) return;
            setCurrentInput((prev) => [...prev, char]);
        },
        [gameStatus, currentInput.length]
    );

    /** Remove the last character from the current input buffer */
    const removeChar = useCallback(() => {
        if (gameStatus !== 'playing') return;
        setCurrentInput((prev) => prev.slice(0, -1));
    }, [gameStatus]);

    /** Submit the current input as a guess */
    const submitGuess = useCallback(() => {
        if (gameStatus !== 'playing') return;
        if (currentInput.length !== WORD_LENGTH) return;

        const answerChars = answer.split('');
        const statuses = evaluateGuess(currentInput, answerChars);
        const newGuess: Guess = { chars: [...currentInput], statuses };

        // Update keyboard character statuses (keep best status per char)
        setKeyStatuses((prev) => {
            const updated = { ...prev };
            currentInput.forEach((char, i) => {
                const incoming = statuses[i];
                const existing = updated[char];
                if (!existing || STATUS_PRIORITY[incoming] > STATUS_PRIORITY[existing]) {
                    updated[char] = incoming;
                }
            });
            return updated;
        });

        const newGuesses = [...guesses, newGuess];
        setGuesses(newGuesses);
        setCurrentInput([]);

        const won = statuses.every((s) => s === 'correct');
        if (won) {
            setGameStatus('won');
        } else if (newGuesses.length >= MAX_GUESSES) {
            setGameStatus('lost');
        }
    }, [gameStatus, currentInput, answer, guesses]);

    /** Reset the game with a new random word */
    const resetGame = useCallback(() => {
        setAnswer(pickWord());
        setGuesses([]);
        setCurrentInput([]);
        setGameStatus('playing');
        setKeyStatuses({});
    }, []);

    return {
        answer,
        guesses,
        currentInput,
        gameStatus,
        keyStatuses,
        addChar,
        removeChar,
        submitGuess,
        resetGame,
    };
}
