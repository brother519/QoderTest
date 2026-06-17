'use client';

import { CardItem, GameConfig } from '../types/game';
import { CARD_GAP } from '../constants/config';
import { Card } from './Card';

interface BoardProps {
    cards: CardItem[];
    config: GameConfig;
    disabled: boolean;
    onCardClick: (id: number) => void;
}

export function Board({ cards, config, disabled, onCardClick }: BoardProps) {
    return (
        <div
            className="grid"
            style={{
                gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
                gap: CARD_GAP,
            }}
        >
            {cards.map((card) => (
                <Card
                    key={card.id}
                    card={card}
                    disabled={disabled}
                    onClick={onCardClick}
                />
            ))}
        </div>
    );
}
