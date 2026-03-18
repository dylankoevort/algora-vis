import React from 'react';
import { useNavigate } from 'react-router-dom';
import { selectCategory, selectSortAlgorithm, selectSearchAlgorithm } from '../stores';
import { SORT_ALGORITHMS, SEARCH_ALGORITHMS } from '../algorithms/meta';
import type { SortAlgorithmMeta, SearchAlgorithmMeta } from '../types';

// ─── Sort card ────────────────────────────────────────────────────────────────

const SortCard: React.FC<{ meta: SortAlgorithmMeta; onSelect: () => void }> = ({ meta, onSelect }) => (
    <button
        onClick={onSelect}
        className="group text-left bg-white border border-stone-200 rounded-xl p-5 hover:border-stone-400 hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 active:scale-[0.98]"
    >
        <div className="flex items-start justify-between mb-3 gap-2">
      <span className="font-display font-700 text-stone-900 text-[15px] leading-snug group-hover:text-stone-700 transition-colors">
        {meta.name}
      </span>
            <span className={`shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full ${meta.stable ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
        {meta.stable ? 'Stable' : 'Unstable'}
      </span>
        </div>
        <p className="text-xs text-stone-500 mb-4 leading-relaxed">{meta.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
      <span className="text-[10px] font-mono bg-stone-50 border border-stone-200 text-stone-600 px-2 py-0.5 rounded-full">
        Best {meta.timeComplexity.best}
      </span>
            <span className="text-[10px] font-mono bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
        Avg {meta.timeComplexity.average}
      </span>
            <span className="text-[10px] font-mono bg-blue-50 border border-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
        Space {meta.spaceComplexity}
      </span>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-stone-400 group-hover:text-stone-800 transition-colors">
            Open visualiser
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                <path d="M2 5.5h7M6 2.5l3 3-3 3" />
            </svg>
        </div>
    </button>
);

// ─── Search card ──────────────────────────────────────────────────────────────

const SearchCard: React.FC<{ meta: SearchAlgorithmMeta; onSelect: () => void }> = ({ meta, onSelect }) => (
    <button
        onClick={onSelect}
        className="group text-left bg-white border border-stone-200 rounded-xl p-5 hover:border-stone-400 hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 active:scale-[0.98]"
    >
        <div className="flex items-start justify-between mb-3 gap-2">
      <span className="font-display font-700 text-stone-900 text-[15px] leading-snug group-hover:text-stone-700 transition-colors pr-1">
        {meta.name}
      </span>
            <div className="flex flex-col gap-1 shrink-0">
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${meta.optimal ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
          {meta.optimal ? 'Optimal' : 'Suboptimal'}
        </span>
            </div>
        </div>
        <p className="text-xs text-stone-500 mb-4 leading-relaxed">{meta.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
      <span className="text-[10px] font-mono bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
        {meta.timeComplexity}
      </span>
            <span className="text-[10px] font-mono bg-blue-50 border border-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
        Space {meta.spaceComplexity}
      </span>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-stone-400 group-hover:text-stone-800 transition-colors">
            Open visualiser
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                <path d="M2 5.5h7M6 2.5l3 3-3 3" />
            </svg>
        </div>
    </button>
);

// ─── Section header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; count: number }> = ({ icon, title, count }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-stone-900 flex items-center justify-center">{icon}</div>
            <h2 className="font-display font-700 text-lg text-stone-900">{title}</h2>
        </div>
        <div className="flex-1 h-px bg-stone-100" />
        <span className="text-xs text-stone-400 font-mono">{count} algorithms</span>
    </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export const HomePage: React.FC = () => {
    const navigate = useNavigate();

    const handleSort = (id: string) => {
        selectSortAlgorithm(id as never);
        selectCategory('sorting');
        navigate('/visualise');
    };

    const handleSearch = (id: string) => {
        selectSearchAlgorithm(id as never);
        selectCategory('searching');
        navigate('/visualise');
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-10 animate-slide-up">

            {/* Hero */}
            <div className="mb-12">
                <div className="inline-flex items-center gap-2 bg-stone-100 rounded-full px-3 py-1 mb-5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-stone-500 font-sans">Interactive Algorithm Visualiser</span>
                </div>
                <h1 className="font-display text-4xl font-800 text-stone-900 leading-tight mb-4">
                    See algorithms<br />
                    <span className="text-stone-300">in motion.</span>
                </h1>
                <p className="text-stone-500 text-base max-w-lg leading-relaxed">
                    Pick an algorithm to open the visualiser. Step through each operation frame by frame,
                    control playback speed, and build real intuition for how it works.
                </p>
            </div>

            {/* Sorting section */}
            <section className="mb-12">
                <SectionHeader
                    title="Sorting Algorithms"
                    count={SORT_ALGORITHMS.length}
                    icon={
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <rect x="1" y="7" width="2.5" height="5" rx="0.5" fill="white" opacity="0.5" />
                            <rect x="5" y="4" width="2.5" height="8" rx="0.5" fill="white" opacity="0.75" />
                            <rect x="9" y="1" width="2.5" height="11" rx="0.5" fill="white" />
                        </svg>
                    }
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {SORT_ALGORITHMS.map((meta) => (
                        <SortCard key={meta.id} meta={meta} onSelect={() => handleSort(meta.id)} />
                    ))}
                </div>
            </section>

            {/* Searching section */}
            <section className="mb-10">
                <SectionHeader
                    title="Pathfinding Algorithms"
                    count={SEARCH_ALGORITHMS.length}
                    icon={
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <circle cx="5.5" cy="5.5" r="3.5" stroke="white" strokeWidth="1.5" />
                            <line x1="8" y1="8" x2="12" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    }
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {SEARCH_ALGORITHMS.map((meta) => (
                        <SearchCard key={meta.id} meta={meta} onSelect={() => handleSearch(meta.id)} />
                    ))}
                </div>
            </section>

            {/* Footer note */}
            <p className="text-xs text-stone-300 text-center pb-2">
                AlgoraVis — by Dylan
            </p>
        </div>
    );
};