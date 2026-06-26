'use client';

/**
 * 数字输入组件
 *
 * 提供数字按钮面板和输入显示区，支持键盘输入和按钮点击。
 *
 * @module guess-number/components/GuessInput
 */

import { useState, useCallback, useEffect } from 'react';

interface GuessInputProps {
    codeLength: number;
    digitRange: number;
    disabled: boolean;
    onSubmit: (guess: string) => boolean;
}

export function GuessInput({ codeLength, digitRange, disabled, onSubmit }: GuessInputProps) {
    const [input, setInput] = useState('');
    const [shake, setShake] = useState(false);

    const addDigit = useCallback(
        (digit: string) => {
            if (disabled) return;
            if (input.length >= codeLength) return;
            if (input.includes(digit)) return;
            setInput((prev) => prev + digit);
        },
        [disabled, input, codeLength],
    );

    const removeDigit = useCallback(() => {
        setInput((prev) => prev.slice(0, -1));
    }, []);

    const clearInput = useCallback(() => {
        setInput('');
    }, []);

    const submit = useCallback(() => {
        if (input.length !== codeLength) return;
        const success = onSubmit(input);
        if (success) {
            setInput('');
        } else {
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    }, [input, codeLength, onSubmit]);

    // 键盘事件
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (disabled) return;

            if (e.key >= '0' && e.key <= '9') {
                const digit = parseInt(e.key, 10);
                if (digit < digitRange) {
                    addDigit(e.key);
                }
            } else if (e.key === 'Backspace') {
                removeDigit();
            } else if (e.key === 'Enter') {
                submit();
            } else if (e.key === 'Escape') {
                clearInput();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [disabled, digitRange, addDigit, removeDigit, submit, clearInput]);

    const digits = Array.from({ length: digitRange }, (_, i) => String(i));

    return (
        <div className="flex flex-col items-center gap-3">
            {/* 输入显示区 */}
            <div
                className={`flex gap-2 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
            >
                {Array.from({ length: codeLength }).map((_, i) => (
                    <div
                        key={i}
                        className={`w-12 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                            input[i]
                                ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
                                : 'border-slate-600 bg-slate-800/50 text-slate-500'
                        }`}
                    >
                        {input[i] || '·'}
                    </div>
                ))}
            </div>

            {/* 数字按钮 */}
            <div className="flex flex-wrap justify-center gap-2 max-w-[280px]">
                {digits.map((d) => (
                    <button
                        key={d}
                        onClick={() => addDigit(d)}
                        disabled={disabled || input.includes(d) || input.length >= codeLength}
                        className={`w-11 h-11 rounded-lg font-bold text-lg transition-all ${
                            input.includes(d)
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-slate-700 hover:bg-emerald-600 text-white active:scale-90'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                        {d}
                    </button>
                ))}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
                <button
                    onClick={removeDigit}
                    disabled={disabled || input.length === 0}
                    className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white/80 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    ← 删除
                </button>
                <button
                    onClick={clearInput}
                    disabled={disabled || input.length === 0}
                    className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white/80 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    清空
                </button>
                <button
                    onClick={submit}
                    disabled={disabled || input.length !== codeLength}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                >
                    确认
                </button>
            </div>
        </div>
    );
}
