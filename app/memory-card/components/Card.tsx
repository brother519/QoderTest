'use client';

import { CardItem } from '../types/game';
import { CARD_SIZE } from '../constants/config';

interface CardProps {
    card: CardItem;
    disabled: boolean;
    onClick: (id: number) => void;
}

export function Card({ card, disabled, onClick }: CardProps) {
    const isRevealed = card.flipped || card.matched;

    return (
        <button
            onClick={() => onClick(card.id)}
            disabled={disabled || card.matched || card.flipped}
            className="relative cursor-pointer disabled:cursor-default"
            style={{
                width: CARD_SIZE,
                height: CARD_SIZE,
                perspective: '600px',
            }}
        >
            <div
                className="absolute inset-0 transition-transform duration-500"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
            >
                {/* 背面 */}
                <div
                    className={`absolute inset-0 rounded-lg flex items-center justify-center text-2xl font-bold
                        bg-gradient-to-br from-teal-600 to-emerald-700
                        border-2 border-teal-400/30
                        shadow-lg shadow-teal-500/20
                        hover:border-teal-300/50 hover:shadow-teal-400/30
                        transition-all duration-200
                        ${!card.matched && !card.flipped ? 'hover:scale-105' : ''}`}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <span className="text-white/60">?</span>
                </div>

                {/* 正面 */}
                <div
                    className={`absolute inset-0 rounded-lg flex items-center justify-center text-3xl
                        bg-gradient-to-br from-slate-800 to-slate-900
                        border-2
                        ${card.matched
                            ? 'border-emerald-400/60 shadow-lg shadow-emerald-400/30'
                            : 'border-slate-600/40'
                        }
                        transition-all duration-300`}
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                    }}
                >
                    {card.emoji}
                </div>
            </div>
        </button>
    );
}
