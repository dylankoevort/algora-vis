import React from 'react';
import type { CellType } from '../../types';

interface MazeCellProps {
    type: CellType;
    size: number;
}

const CELL_CLASSES: Record<CellType, string> = {
    empty: 'bg-white',
    wall: 'bg-stone-800',
    start: 'bg-emerald-500',
    end: 'bg-rose-500',
    visited: 'bg-sky-300',
    frontier: 'bg-amber-200',
    path: 'bg-violet-400',
};

export const MazeCell: React.FC<MazeCellProps> = React.memo(({ type, size }) => {
    const isStart = type === 'start';
    const isEnd = type === 'end';

    return (
        <div
            className={`${CELL_CLASSES[type]} transition-colors duration-75 flex items-center justify-center`}
            style={{ width: size, height: size }}
        >
            {isStart && (
                <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 10 10" fill="white">
                    <polygon points="2,1 9,5 2,9" />
                </svg>
            )}
            {isEnd && (
                <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 10 10" fill="white">
                    <rect x="2" y="2" width="6" height="6" rx="1" />
                </svg>
            )}
        </div>
    );
});

MazeCell.displayName = 'MazeCell';