import React, { useCallback, useEffect, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import {
    $activeSortAlgorithm,
    $sortSteps,
    $sortArraySize,
    $currentSortStep,
    $playState,
    resetPlayback,
} from '../../stores';
import { runSortAlgorithm, generateRandomArray } from '../../algorithms/sorting';
import { getSortMeta } from '../../algorithms/meta';
import { usePlayback } from '../../hooks/usePlayback';
import { useSortSound } from '../../hooks/useSortSound';
import { SortInfoPanel } from '../layout/InfoPanel';
import { Button } from '../ui';
import { MuteButton } from '../ui/MuteButton';
import type { SortBarState } from '../../types';

const BAR_COLOR_MAP: Record<SortBarState, string> = {
    default:   '#d6d3d1',
    comparing: '#fbbf24',
    swapping:  '#fb7185',
    sorted:    '#4ade80',
    pivot:     '#a78bfa',
    selected:  '#38bdf8',
};

const BAR_LABEL_MAP: Record<SortBarState, string> = {
    default:   'Default',
    comparing: 'Comparing',
    swapping:  'Swapping / Writing',
    sorted:    'Sorted',
    pivot:     'Pivot',
    selected:  'Selected',
};

const Legend: React.FC = () => (
    <div className="flex flex-wrap gap-3 px-6 py-2 border-b border-stone-100 bg-stone-50">
        {(Object.entries(BAR_COLOR_MAP) as [SortBarState, string][]).map(([state, color]) => (
            <div key={state} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs text-stone-500">{BAR_LABEL_MAP[state]}</span>
            </div>
        ))}
    </div>
);

export const SortingVisualiser: React.FC = () => {
    usePlayback();

    const algorithmId = useStore($activeSortAlgorithm);
    const arraySize   = useStore($sortArraySize);
    const currentStep = useStore($currentSortStep);
    const sortSteps   = useStore($sortSteps);
    const playState   = useStore($playState);
    const meta        = getSortMeta(algorithmId);

    const generateAndInit = useCallback(() => {
        const values = generateRandomArray(arraySize);
        resetPlayback();
        const steps = runSortAlgorithm(algorithmId, values);
        $sortSteps.set(steps);
    }, [algorithmId, arraySize]);

    useEffect(() => {
        const values = generateRandomArray(arraySize);
        resetPlayback();
        const steps = runSortAlgorithm(algorithmId, values);
        $sortSteps.set(steps);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [algorithmId, arraySize]);

    const displayStep = currentStep ?? sortSteps[0] ?? null;
    const bars = displayStep?.bars ?? [];
    const maxVal = useMemo(() => Math.max(...bars.map((b) => b.value), 1), [bars]);

    // Sound effects
    useSortSound(currentStep, sortSteps, maxVal);

    return (
        <div className="flex flex-col" style={{ height: '100%' }}>
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-stone-100 shrink-0">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={generateAndInit}
                    disabled={playState === 'playing'}
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M1 6a5 5 0 1 0 1.2-3.2" />
                        <polyline points="1,1 1,4.5 4.5,4.5" />
                    </svg>
                    Randomise
                </Button>

                <MuteButton />

                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-stone-500">Size</span>
                    <input
                        type="range" min={10} max={120} value={arraySize}
                        disabled={playState === 'playing'}
                        onChange={(e) => $sortArraySize.set(Number(e.target.value))}
                        className="w-24 disabled:opacity-40"
                        style={{ accentColor: '#44403c' }}
                    />
                    <span className="text-xs font-mono text-stone-600 w-8">{arraySize}</span>
                </div>
            </div>

            <Legend />

            {/* Bar chart */}
            <div
                className="flex items-end bg-white px-4 py-4 gap-px overflow-hidden"
                style={{ flex: 1, minHeight: 0 }}
            >
                {bars.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-stone-300 text-sm">
                        Generating…
                    </div>
                ) : (
                    bars.map((bar, i) => {
                        const heightPct = (bar.value / maxVal) * 100;
                        return (
                            <div key={i} className="flex flex-col justify-end" style={{ flex: 1, minWidth: 2, height: '100%' }}>
                                <div
                                    style={{
                                        height: `${heightPct}%`,
                                        backgroundColor: BAR_COLOR_MAP[bar.state],
                                        borderRadius: '2px 2px 0 0',
                                        transition: 'height 60ms linear, background-color 60ms linear',
                                        width: '100%',
                                    }}
                                    title={`${bar.value}`}
                                />
                            </div>
                        );
                    })
                )}
            </div>

            <div className="shrink-0">
                <SortInfoPanel
                    meta={meta}
                    comparisons={displayStep?.comparisons ?? 0}
                    swaps={displayStep?.swaps ?? 0}
                    stepDescription={displayStep?.description ?? ''}
                />
            </div>
        </div>
    );
};