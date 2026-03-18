import React from 'react';
import { useStore } from '@nanostores/react';
import { useNavigate } from 'react-router-dom';
import {
    $activeCategory,
    $activeSortAlgorithm,
    $activeSearchAlgorithm,
    selectSortAlgorithm,
    selectSearchAlgorithm,
    selectCategory,
} from '../../stores';
import { SORT_ALGORITHMS, SEARCH_ALGORITHMS } from '../../algorithms/meta';
import { PlayControls } from './PlayControls';
import type { SortAlgorithmId, SearchAlgorithmId } from '../../types';

const AlgoraLogo: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2.5 mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 rounded-lg"
    >
        <div className="w-7 h-7 rounded-lg bg-stone-900 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="9" width="2" height="5" rx="0.5" fill="white" opacity="0.5" />
                <rect x="5" y="6" width="2" height="8" rx="0.5" fill="white" opacity="0.7" />
                <rect x="8" y="3" width="2" height="11" rx="0.5" fill="white" />
                <rect x="11" y="5" width="2" height="9" rx="0.5" fill="white" opacity="0.8" />
            </svg>
        </div>
        <span className="font-display text-base font-700 text-stone-900 tracking-tight hidden sm:block">
      Algora<span className="text-stone-400 font-600">Vis</span>
    </span>
    </button>
);

export const TopBar: React.FC = () => {
    const category = useStore($activeCategory);
    const sortId = useStore($activeSortAlgorithm);
    const searchId = useStore($activeSearchAlgorithm);
    const navigate = useNavigate();

    const handleSortChange = (id: SortAlgorithmId) => {
        selectSortAlgorithm(id);
        selectCategory('sorting');
        navigate('/visualise');
    };

    const handleSearchChange = (id: SearchAlgorithmId) => {
        selectSearchAlgorithm(id);
        selectCategory('searching');
        navigate('/visualise');
    };

    return (
        <header className="h-14 bg-white border-b border-stone-200 flex items-center px-4 gap-3 sticky top-0 z-40 shadow-sm">
            <AlgoraLogo onClick={() => navigate('/')} />

            {/* Vertical divider */}
            <div className="w-px h-6 bg-stone-200 shrink-0" />

            {/* Algorithm selectors */}
            <div className="flex items-center gap-2 shrink-0">
                {/* Sorting dropdown */}
                <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-stone-400 font-sans hidden md:block">
            Sort
          </span>
                    <select
                        value={sortId}
                        onChange={(e) => handleSortChange(e.target.value as SortAlgorithmId)}
                        className={`text-sm font-sans rounded-lg px-2.5 py-1.5 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-stone-300 cursor-pointer ${
                            category === 'sorting'
                                ? 'bg-stone-900 text-white border-stone-900 font-medium'
                                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                        }`}
                    >
                        {SORT_ALGORITHMS.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Search dropdown */}
                <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-stone-400 font-sans hidden md:block">
            Search
          </span>
                    <select
                        value={searchId}
                        onChange={(e) => handleSearchChange(e.target.value as SearchAlgorithmId)}
                        className={`text-sm font-sans rounded-lg px-2.5 py-1.5 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-stone-300 cursor-pointer ${
                            category === 'searching'
                                ? 'bg-stone-900 text-white border-stone-900 font-medium'
                                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                        }`}
                    >
                        {SEARCH_ALGORITHMS.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Current algorithm name pill */}
            {category && (
                <div className="hidden lg:flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 shrink-0">
                    <span className="text-[10px] uppercase tracking-widest text-stone-400">Active</span>
                    <span className="text-sm font-medium text-stone-800">
            {category === 'sorting'
                ? SORT_ALGORITHMS.find((a) => a.id === sortId)?.name
                : SEARCH_ALGORITHMS.find((a) => a.id === searchId)?.name}
          </span>
                </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Play controls — only shown on visualiser page */}
            {category && <PlayControls />}
        </header>
    );
};