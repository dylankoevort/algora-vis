import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import {
    $activeSearchAlgorithm,
    $searchSteps,
    $mazeGrid,
    $mazeSize,
    $currentSearchStep,
    $playState,
    resetPlayback,
} from '../../stores';
import { runSearchAlgorithm, generateMaze } from '../../algorithms/searching';
import { getSearchMeta } from '../../algorithms/meta';
import { usePlayback } from '../../hooks/usePlayback';
import { SearchInfoPanel } from '../layout/InfoPanel';
import { MazeCell } from './MazeCell';
import { Button } from '../ui';
import type { CellType } from '../../types';

const LEGEND_ITEMS: { type: CellType; label: string; className: string }[] = [
    { type: 'start', label: 'Start', className: 'bg-emerald-500' },
    { type: 'end', label: 'End', className: 'bg-rose-500' },
    { type: 'wall', label: 'Wall', className: 'bg-stone-800' },
    { type: 'visited', label: 'Visited', className: 'bg-sky-300 border border-sky-400' },
    { type: 'frontier', label: 'Frontier', className: 'bg-amber-200 border border-amber-300' },
    { type: 'path', label: 'Path', className: 'bg-violet-400' },
];

export const SearchingVisualiser: React.FC = () => {
    usePlayback();

    const algorithmId = useStore($activeSearchAlgorithm);
    const mazeGrid = useStore($mazeGrid);
    const mazeSize = useStore($mazeSize);
    const currentStep = useStore($currentSearchStep);
    const playState = useStore($playState);
    const meta = getSearchMeta(algorithmId);

    const containerRef = useRef<HTMLDivElement>(null);
    const [cellSize, setCellSize] = useState(18);

    const generateNewMaze = useCallback(() => {
        const maze = generateMaze(mazeSize.rows, mazeSize.cols);
        $mazeGrid.set(maze);
        resetPlayback();
        // Compute steps immediately so we don't need a second effect
        const steps = runSearchAlgorithm(algorithmId, maze);
        $searchSteps.set(steps);
    }, [mazeSize, algorithmId]);

    // On mount: generate if no maze, otherwise just recompute steps
    const mountedRef = useRef(false);
    useEffect(() => {
        if (mountedRef.current) return;
        mountedRef.current = true;
        const existing = $mazeGrid.get();
        if (!existing) {
            generateNewMaze();
        } else {
            resetPlayback();
            const steps = runSearchAlgorithm(algorithmId, existing);
            $searchSteps.set(steps);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // When algorithm changes after mount, rerun on existing maze
    const algorithmIdRef = useRef(algorithmId);
    useEffect(() => {
        if (algorithmId === algorithmIdRef.current) return;
        algorithmIdRef.current = algorithmId;
        const existing = $mazeGrid.get();
        if (!existing) return;
        resetPlayback();
        const steps = runSearchAlgorithm(algorithmId, existing);
        $searchSteps.set(steps);
    }, [algorithmId]);

    // Compute cell size from container
    useEffect(() => {
        const update = () => {
            if (!containerRef.current) return;
            const { width, height } = containerRef.current.getBoundingClientRect();
            const cols = mazeGrid?.cols ?? mazeSize.cols;
            const rows = mazeGrid?.rows ?? mazeSize.rows;
            const maxW = Math.floor((width - 24) / cols);
            const maxH = Math.floor((height - 24) / rows);
            setCellSize(Math.max(4, Math.min(maxW, maxH, 28)));
        };
        update();
        const ro = new ResizeObserver(update);
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [mazeGrid, mazeSize]);

    const grid = currentStep?.grid ?? mazeGrid?.cells;

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-stone-100 flex-wrap">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={generateNewMaze}
                    disabled={playState === 'playing'}
                >
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    >
                        <path d="M1 6a5 5 0 1 0 1.2-3.2" /><polyline points="1,1 1,4.5 4.5,4.5" />
                    </svg>
                    New Maze
                </Button>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 ml-auto">
                    {LEGEND_ITEMS.map((item) => (
                        <div key={item.type} className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded-sm ${item.className}`} />
                            <span className="text-xs text-stone-500">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Maze grid */}
            <div
                ref={containerRef}
                className="flex-1 flex items-center justify-center bg-stone-50 overflow-hidden p-3"
            >
                {grid ? (
                    <div
                        className="border border-stone-200 rounded-lg overflow-hidden shadow-sm"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${grid[0].length}, ${cellSize}px)`,
                            gridTemplateRows: `repeat(${grid.length}, ${cellSize}px)`,
                            gap: 0,
                        }}
                    >
                        {grid.map((row, ri) =>
                            row.map((cell, ci) => (
                                <MazeCell key={`${ri}-${ci}`} type={cell.type} size={cellSize} />
                            )),
                        )}
                    </div>
                ) : (
                    <div className="text-stone-400 text-sm">Generating maze…</div>
                )}
            </div>

            {/* Info panel */}
            <SearchInfoPanel
                meta={meta}
                visitedCount={currentStep?.visitedCount ?? 0}
                frontierCount={currentStep?.frontierCount ?? 0}
                pathLength={currentStep?.pathLength}
                stepDescription={currentStep?.description ?? ''}
            />
        </div>
    );
};