import React from 'react';
import { Badge, Stat } from '../ui';
import type { SortAlgorithmMeta, SearchAlgorithmMeta } from '../../types';

interface SortInfoPanelProps {
    meta: SortAlgorithmMeta;
    comparisons: number;
    swaps: number;
    stepDescription: string;
}

export const SortInfoPanel: React.FC<SortInfoPanelProps> = ({
                                                                meta,
                                                                comparisons,
                                                                swaps,
                                                                stepDescription,
                                                            }) => (
    <div className="bg-white border-t border-stone-100 px-6 py-4 flex flex-wrap gap-6 items-start">
        <div className="flex-1 min-w-[200px]">
            <p className="text-xs text-stone-500 mb-1">{meta.description}</p>
            <p className="text-sm font-mono text-stone-700 bg-stone-50 rounded-lg px-3 py-2 border border-stone-100 min-h-[36px]">
                {stepDescription || 'Press play to start'}
            </p>
        </div>

        <div className="flex gap-6 flex-wrap">
            <Stat label="Comparisons" value={comparisons} mono />
            <Stat label="Swaps" value={swaps} mono />
            <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-stone-400">Complexity</span>
                <div className="flex gap-1 flex-wrap">
                    <Badge variant="green">Best {meta.timeComplexity.best}</Badge>
                    <Badge variant="amber">Avg {meta.timeComplexity.average}</Badge>
                    <Badge variant="red">Worst {meta.timeComplexity.worst}</Badge>
                    <Badge variant="blue">Space {meta.spaceComplexity}</Badge>
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-stone-400">Properties</span>
                <Badge variant={meta.stable ? 'green' : 'default'}>
                    {meta.stable ? 'Stable' : 'Unstable'}
                </Badge>
            </div>
        </div>
    </div>
);

interface SearchInfoPanelProps {
    meta: SearchAlgorithmMeta;
    visitedCount: number;
    frontierCount: number;
    pathLength?: number;
    stepDescription: string;
}

export const SearchInfoPanel: React.FC<SearchInfoPanelProps> = ({
                                                                    meta,
                                                                    visitedCount,
                                                                    frontierCount,
                                                                    pathLength,
                                                                    stepDescription,
                                                                }) => (
    <div className="bg-white border-t border-stone-100 px-6 py-4 flex flex-wrap gap-6 items-start">
        <div className="flex-1 min-w-[200px]">
            <p className="text-xs text-stone-500 mb-1">{meta.description}</p>
            <p className="text-sm font-mono text-stone-700 bg-stone-50 rounded-lg px-3 py-2 border border-stone-100 min-h-[36px]">
                {stepDescription || 'Press play to start'}
            </p>
        </div>

        <div className="flex gap-6 flex-wrap">
            <Stat label="Visited" value={visitedCount} mono />
            <Stat label="Frontier" value={frontierCount} mono />
            {pathLength !== undefined && <Stat label="Path length" value={pathLength} mono />}
            <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-stone-400">Complexity</span>
                <div className="flex gap-1 flex-wrap">
                    <Badge variant="amber">Time {meta.timeComplexity}</Badge>
                    <Badge variant="blue">Space {meta.spaceComplexity}</Badge>
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-stone-400">Properties</span>
                <div className="flex gap-1">
                    <Badge variant={meta.optimal ? 'green' : 'default'}>
                        {meta.optimal ? 'Optimal' : 'Not optimal'}
                    </Badge>
                    <Badge variant={meta.complete ? 'green' : 'default'}>
                        {meta.complete ? 'Complete' : 'Incomplete'}
                    </Badge>
                </div>
            </div>
        </div>
    </div>
);