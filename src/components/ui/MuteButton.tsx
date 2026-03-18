import React from 'react';
import { useStore } from '@nanostores/react';
import { $muted } from '../../stores';
import { setMuted } from '../../utils/sound';

export const MuteButton: React.FC = () => {
    const muted = useStore($muted);

    const toggle = () => {
        const next = !muted;
        $muted.set(next);
        setMuted(next);
    };

    return (
        <button
            onClick={toggle}
            title={muted ? 'Unmute sounds' : 'Mute sounds'}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-all duration-100"
        >
            {muted ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="2,4.5 5,4.5 9,1.5 9,12.5 5,9.5 2,9.5" fill="currentColor" stroke="none" opacity="0.4" />
                    <line x1="11" y1="4" x2="13" y2="10" />
                    <line x1="13" y1="4" x2="11" y2="10" />
                </svg>
            ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="2,4.5 5,4.5 9,1.5 9,12.5 5,9.5 2,9.5" fill="currentColor" stroke="none" opacity="0.6" />
                    <path d="M11 4.5a3.5 3.5 0 0 1 0 5" />
                    <path d="M12.5 2.5a6 6 0 0 1 0 9" />
                </svg>
            )}
        </button>
    );
};