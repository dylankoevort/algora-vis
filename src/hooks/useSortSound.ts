import { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { $muted, $playState } from '../stores';
import {
    setMuted,
    setSortMaxValue,
    soundCompare,
    soundSwap,
    soundSorted,
    soundPivot,
    soundSortComplete,
} from '../utils/sound';
import type { SortStep } from '../types';

export function useSortSound(
    currentStep: SortStep | null,
    sortSteps: SortStep[],
    maxVal: number,
) {
    const muted    = useStore($muted);
    const playState = useStore($playState);

    // Sync muted preference to the audio engine on mount and change
    useEffect(() => { setMuted(muted); }, [muted]);

    // Keep the engine's max-value reference up to date
    useEffect(() => { setSortMaxValue(maxVal); }, [maxVal]);

    // Fire a sound on each new step while playing
    const prevIdxRef = useRef(-1);
    useEffect(() => {
        if (playState !== 'playing' || !currentStep) return;

        const idx = sortSteps.indexOf(currentStep);
        if (idx === prevIdxRef.current) return;
        prevIdxRef.current = idx;

        const comparing = currentStep.bars.filter(b => b.state === 'comparing');
        const swapping  = currentStep.bars.filter(b => b.state === 'swapping');
        const pivots    = currentStep.bars.filter(b => b.state === 'pivot');
        const allSorted = currentStep.bars.every(b => b.state === 'sorted');

        if (allSorted) {
            soundSortComplete();
        } else if (swapping.length > 0) {
            soundSwap(swapping[0].value);
        } else if (pivots.length > 0) {
            soundPivot(pivots[0].value);
        } else if (comparing.length >= 2) {
            soundCompare(comparing[0].value, comparing[1].value);
        } else if (comparing.length === 1) {
            soundCompare(comparing[0].value, comparing[0].value);
        }
    }, [currentStep, playState, sortSteps]);

    // Ripple chime across all bars when the sort finishes
    useEffect(() => {
        if (playState !== 'finished') return;
        const finalBars = sortSteps[sortSteps.length - 1]?.bars ?? [];
        finalBars.forEach((bar, i) => {
            soundSorted(bar.value, i * 12);
        });
    }, [playState, sortSteps]);
}