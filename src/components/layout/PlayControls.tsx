import React from 'react';
import { useStore } from '@nanostores/react';
import { $playState, $speed, $currentStepIndex, $totalSteps, $progress } from '../../stores';
import { play, pause, restart, stepForward, stepBackward } from '../../hooks/usePlayback';
import type { Speed } from '../../types';

const SPEEDS: { label: string; value: Speed }[] = [
    { label: '0.5×', value: 0.5 },
    { label: '1×', value: 1 },
    { label: '2×', value: 2 },
    { label: '3×', value: 3 },
];

// ─── Icon primitives ──────────────────────────────────────────────────────────

const IconPlay = () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
        <polygon points="2.5,1 12,6.5 2.5,12" />
    </svg>
);
const IconPause = () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
        <rect x="2" y="1.5" width="3.5" height="10" rx="1" />
        <rect x="7.5" y="1.5" width="3.5" height="10" rx="1" />
    </svg>
);
const IconRestart = () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1.5 6.5a5 5 0 1 0 1.4-3.5" />
        <polyline points="1.5,1.5 1.5,5.5 5.5,5.5" />
    </svg>
);
const IconStepBack = () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
        <rect x="1" y="1.5" width="3" height="10" rx="1" />
        <polygon points="11.5,1.5 5,6.5 11.5,11.5" />
    </svg>
);
const IconStepForward = () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
        <rect x="9" y="1.5" width="3" height="10" rx="1" />
        <polygon points="1.5,1.5 8,6.5 1.5,11.5" />
    </svg>
);

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS_STYLES = {
    idle:     'bg-stone-100 text-stone-400',
    playing:  'bg-emerald-50 text-emerald-600',
    paused:   'bg-amber-50 text-amber-600',
    finished: 'bg-blue-50 text-blue-600',
};
const STATUS_LABELS = {
    idle:     'Idle',
    playing:  '● Live',
    paused:   '‖ Paused',
    finished: '✓ Done',
};

export const PlayControls: React.FC = () => {
    const playState = useStore($playState);
    const speed = useStore($speed);
    const currentStep = useStore($currentStepIndex);
    const totalSteps = useStore($totalSteps);
    const progress = useStore($progress);

    const isPlaying = playState === 'playing';
    const hasSteps = totalSteps > 0;
    const atEnd = currentStep >= totalSteps - 1;
    const atStart = currentStep === 0;

    const ghost = 'inline-flex items-center justify-center w-7 h-7 rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-900 active:scale-90 transition-all duration-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-stone-500';
    const primary = 'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-stone-900 text-white hover:bg-stone-700 active:scale-90 transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed';

    return (
        <div className="flex items-center gap-1.5">

            {/* Step back */}
            <button
                className={ghost}
                onClick={stepBackward}
                disabled={!hasSteps || atStart || isPlaying}
                title="Step backward"
            >
                <IconStepBack />
            </button>

            {/* Play / Pause — primary CTA */}
            <button
                className={primary}
                onClick={isPlaying ? pause : play}
                disabled={!hasSteps}
                title={isPlaying ? 'Pause' : playState === 'finished' ? 'Replay from start' : 'Play'}
            >
                {isPlaying ? <IconPause /> : <IconPlay />}
            </button>

            {/* Step forward */}
            <button
                className={ghost}
                onClick={stepForward}
                disabled={!hasSteps || atEnd || isPlaying}
                title="Step forward"
            >
                <IconStepForward />
            </button>

            {/* Restart */}
            <button
                className={ghost}
                onClick={restart}
                disabled={!hasSteps && playState === 'idle'}
                title="Restart"
            >
                <IconRestart />
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-stone-200 mx-0.5" />

            {/* Speed pills */}
            <div className="flex items-center gap-0.5 bg-stone-100 rounded-lg p-0.5">
                {SPEEDS.map((s) => (
                    <button
                        key={s.value}
                        onClick={() => $speed.set(s.value)}
                        className={`px-2 py-0.5 rounded-md text-xs font-mono font-medium transition-all duration-100 ${
                            speed === s.value
                                ? 'bg-white text-stone-900 shadow-sm'
                                : 'text-stone-500 hover:text-stone-800'
                        }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-stone-200 mx-0.5" />

            {/* Progress bar + counter */}
            {hasSteps && (
                <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-stone-100 rounded-full overflow-hidden hidden sm:block">
                        <div
                            className="h-full bg-stone-700 rounded-full transition-all duration-100"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-xs font-mono text-stone-400 tabular-nums hidden sm:block">
            {currentStep + 1}<span className="text-stone-300">/{totalSteps}</span>
          </span>
                </div>
            )}

            {/* Status pill */}
            <span className={`text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[playState]}`}>
        {STATUS_LABELS[playState]}
      </span>

        </div>
    );
};