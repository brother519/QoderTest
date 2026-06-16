'use client';

import { TubeState } from '../types/game';
import { TUBE_GAP } from '../constants/config';
import { Tube } from './Tube';

interface BoardProps {
    tubes: TubeState[];
    selectedTube: number | null;
    canPlace: (index: number) => boolean;
    onTubeClick: (index: number) => void;
}

export function Board({ tubes, selectedTube, canPlace, onTubeClick }: BoardProps) {
    return (
        <div className="overflow-x-auto w-full px-4 py-2">
            <div
                className="flex flex-row items-end justify-center min-w-fit pb-4"
                style={{ gap: TUBE_GAP }}
            >
                {tubes.map((tube, index) => (
                    <div key={index} className="flex flex-col items-center gap-1">
                        <Tube
                            tube={tube}
                            isSelected={selectedTube === index}
                            isValidTarget={
                                selectedTube !== null &&
                                selectedTube !== index &&
                                canPlace(index)
                            }
                            onClick={() => onTubeClick(index)}
                        />
                        <span className="text-white/20 text-xs">{index + 1}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
