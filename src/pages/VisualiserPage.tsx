import React from 'react';
import { useStore } from '@nanostores/react';
import { useNavigate } from 'react-router-dom';
import { $activeCategory, $currentStepIndex, $totalSteps, $playState } from '../stores';
import { SortingVisualiser } from '../components/sorting/SortingVisualiser';
import { SearchingVisualiser } from '../components/searching/SearchingVisualiser';

/** Thin clickable scrubber that sits between the TopBar and the visualiser */
const ProgressScrubber: React.FC = () => {
    const currentStep = useStore($currentStepIndex);
    const totalSteps = useStore($totalSteps);
    const playState = useStore($playState);
    const pct = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (totalSteps === 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const target = Math.round(ratio * (totalSteps - 1));
        $currentStepIndex.set(target);
        if (playState === 'playing') {
            // Keep playing from the new position — the hook will pick it up
        }
    };

    if (totalSteps === 0) return null;

    return (
        <div
            className="h-1 bg-stone-100 cursor-pointer group relative"
            onClick={handleClick}
            title={`Step ${currentStep + 1} of ${totalSteps}`}
        >
            <div
                className="h-full bg-stone-700 transition-all duration-75 group-hover:bg-stone-500"
                style={{ width: `${pct}%` }}
            />
            {/* Thumb dot */}
            <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-stone-700 border-2 border-white shadow opacity-0 group-hover:opacity-100 transition-opacity duration-100 -ml-1.5"
                style={{ left: `${pct}%` }}
            />
        </div>
    );
};

export const VisualiserPage: React.FC = () => {
    const category = useStore($activeCategory);
    const navigate = useNavigate();

    if (!category) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4 animate-fade-in">
                <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18" />
                    </svg>
                </div>
                <p className="text-stone-500 text-sm">No algorithm selected.</p>
                <button
                    onClick={() => navigate('/')}
                    className="text-sm font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600 transition-colors"
                >
                    Back to algorithm selection
                </button>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-3.5rem)] flex flex-col animate-fade-in">
            <ProgressScrubber />
            <div className="flex-1 overflow-hidden">
                {category === 'sorting' ? <SortingVisualiser /> : <SearchingVisualiser />}
            </div>
        </div>
    );
};