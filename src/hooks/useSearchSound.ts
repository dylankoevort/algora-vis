import { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { $muted, $playState } from '../stores';
import {
    setMuted,
    soundVisit,
    soundFrontier,
    soundPathFound,
    soundNoPath,
} from '../utils/sound';
import type { SearchStep } from '../types';

export function useSearchSound(
    currentStep: SearchStep | null,
    searchSteps: SearchStep[],
) {
    const muted     = useStore($muted);
    const playState = useStore($playState);

    // Sync muted preference to audio engine on mount and change
    useEffect(() => { setMuted(muted); }, [muted]);

    const prevIdxRef = useRef(-1);
    useEffect(() => {
        if (playState !== 'playing' || !currentStep) return;

        const idx = searchSteps.indexOf(currentStep);
        if (idx === prevIdxRef.current) return;
        prevIdxRef.current = idx;

        if (currentStep.pathFound === true) {
            soundPathFound();
        } else if (currentStep.pathFound === false) {
            soundNoPath();
        } else if (currentStep.frontierCount > (searchSteps[idx - 1]?.frontierCount ?? 0)) {
            soundFrontier();
        } else {
            soundVisit();
        }
    }, [currentStep, playState, searchSteps]);
}