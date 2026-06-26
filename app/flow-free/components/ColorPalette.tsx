'use client';

import React from 'react';
import { Position } from '../types/game';
import { FLOW_COLORS } from '../constants/config';

interface ColorPaletteProps {
  totalColors: number;
  completedColors: Set<number>;
  paths: Map<number, Position[]>;
}

export default function ColorPalette({ totalColors, completedColors, paths }: ColorPaletteProps) {
  if (totalColors === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-2">
      {Array.from({ length: totalColors }, (_, colorId) => {
        const color = FLOW_COLORS[colorId] || '#ffffff';
        const isCompleted = completedColors.has(colorId);
        const hasPath = (paths.get(colorId)?.length ?? 0) > 0;

        return (
          <div
            key={colorId}
            className="relative flex items-center justify-center"
            title={`Color ${colorId + 1}${isCompleted ? ' (completed)' : hasPath ? ' (in progress)' : ''}`}
          >
            {/* Outer ring */}
            <div
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200"
              style={{
                borderColor: color,
                backgroundColor: isCompleted
                  ? color
                  : hasPath
                    ? `${color}33`
                    : 'transparent',
                boxShadow: isCompleted ? `0 0 8px ${color}80` : 'none',
              }}
            >
              {/* Completed checkmark */}
              {isCompleted && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M3.5 8L6.5 11L12.5 5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {/* In-progress indicator (inner dot) */}
              {!isCompleted && hasPath && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color, opacity: 0.8 }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
