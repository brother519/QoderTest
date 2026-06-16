'use client';

interface ControlHintsProps {
    hints: string[];
    className?: string;
}

export function ControlHints({ hints, className = 'text-gray-500 text-sm' }: ControlHintsProps) {
    return (
        <div className={`mt-4 ${className}`}>
            {hints.join(' \u00a0| \u00a0')}
        </div>
    );
}
