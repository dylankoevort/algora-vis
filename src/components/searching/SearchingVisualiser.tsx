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

const LEGEND_ITEMS: { type: CellType; label: string; color: string }[] = [
    { type: 'start',    label: 'Start',    color: '#10b981' },
    { type: 'end',      label: 'End',      color: '#f43f5e' },
    { type: 'wall',     label: 'Wall',     color: '#292524' },
    { type: 'visited',  label: 'Visited',  color: '#e0f2fe' },
    { type: 'frontier', label: 'Frontier', color: '#fde68a' },
    { type: 'path',     label: 'Path',     color: '#a78bfa' },
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

    // When maze size changes after mount, generate a fresh maze at the new size
    const mazeSizeRef = useRef(mazeSize);
    useEffect(() => {
        if (
            mazeSize.rows === mazeSizeRef.current.rows &&
            mazeSize.cols === mazeSizeRef.current.cols
        ) return;
        mazeSizeRef.current = mazeSize;
        generateNewMaze();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mazeSize]);

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
            <div className="flex items-center gap-4 px-6 py-3 bg-white border-b border-stone-100 flex-wrap">
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

                {/* Divider */}
                <div className="w-px h-5 bg-stone-200 shrink-0" />

                {/* Size sliders */}
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-500 shrink-0">Cols</span>
                        <input
                            type="range"
                            min={11}
                            max={61}
                            step={2}
                            value={mazeSize.cols}
                            disabled={playState === 'playing'}
                            onChange={(e) => {
                                const cols = Number(e.target.value);
                                $mazeSize.set({ ...mazeSize, cols });
                            }}
                            className="w-20 disabled:opacity-40"
                            style={{ accentColor: '#44403c' }}
                        />
                        <span className="text-xs font-mono text-stone-600 w-6 tabular-nums">{mazeSize.cols}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-500 shrink-0">Rows</span>
                        <input
                            type="range"
                            min={11}
                            max={41}
                            step={2}
                            value={mazeSize.rows}
                            disabled={playState === 'playing'}
                            onChange={(e) => {
                                const rows = Number(e.target.value);
                                $mazeSize.set({ ...mazeSize, rows });
                            }}
                            className="w-20 disabled:opacity-40"
                            style={{ accentColor: '#44403c' }}
                        />
                        <span className="text-xs font-mono text-stone-600 w-6 tabular-nums">{mazeSize.rows}</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 ml-auto">
                    {LEGEND_ITEMS.map((item) => (
                        <div key={item.type} className="flex items-center gap-1.5">
                            <div
                                className="w-3 h-3 rounded-sm shrink-0"
                                style={{ backgroundColor: item.color }}
                            />
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