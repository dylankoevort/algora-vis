import { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import {
    $playState,
    $speed,
    $currentStepIndex,
    $totalSteps,
} from '../stores';

/** Base delay in ms at speed 1× */
const BASE_DELAY_MS = 100;

/**
 * Drop this hook into any visualiser component to drive the animation loop.
 * Uses setTimeout instead of requestAnimationFrame so the delay is speed-accurate.
 */
export function usePlayback() {
    const playState = useStore($playState);
    const speed = useStore($speed);
    const currentStep = useStore($currentStepIndex);
    const totalSteps = useStore($totalSteps);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Clear any pending tick whenever deps change
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (playState !== 'playing') return;

        // Reached the last frame — mark finished
        if (currentStep >= totalSteps - 1) {
            $playState.set('finished');
            return;
        }

        const delay = BASE_DELAY_MS / speed;
        timerRef.current = setTimeout(() => {
            $currentStepIndex.set(currentStep + 1);
        }, delay);

        return () => {
            if (timerRef.current !== null) clearTimeout(timerRef.current);
        };
    }, [playState, speed, currentStep, totalSteps]);
}

// ─── Standalone action helpers (call outside of React components) ─────────────

export function play() {
    const total = $totalSteps.get();
    if (total === 0) return;

    const state = $playState.get();
    const step = $currentStepIndex.get();

    // If we're at the end or already finished, replay from the beginning
    if (state === 'finished' || step >= total - 1) {
        $currentStepIndex.set(0);
    }

    $playState.set('playing');
}

export function pause() {
    if ($playState.get() === 'playing') {
        $playState.set('paused');
    }
}

export function stepForward() {
    const idx = $currentStepIndex.get();
    const total = $totalSteps.get();
    if (idx < total - 1) {
        $currentStepIndex.set(idx + 1);
        // Don't force-pause if already idle — just advance the frame
        if ($playState.get() === 'playing') $playState.set('paused');
    }
}

export function stepBackward() {
    const idx = $currentStepIndex.get();
    if (idx > 0) {
        $currentStepIndex.set(idx - 1);
        if ($playState.get() === 'playing') $playState.set('paused');
    }
}

export function restart() {
    $currentStepIndex.set(0);
    $playState.set('idle');
}