import { atom, computed } from 'nanostores';
import type {
    AlgorithmCategory,
    SortAlgorithmId,
    SearchAlgorithmId,
    PlayState,
    Speed,
    SortStep,
    SearchStep,
    MazeGrid,
} from '../types';

// ─── Persistence helpers ───────────────────────────────────────────────────────

function persistedAtom<T>(key: string, defaultValue: T) {
    const stored = localStorage.getItem(key);
    const initial: T = stored !== null ? (JSON.parse(stored) as T) : defaultValue;
    const store = atom<T>(initial);
    store.subscribe((value) => {
        localStorage.setItem(key, JSON.stringify(value));
    });
    return store;
}

// ─── Navigation / Selection ───────────────────────────────────────────────────

export const $activeCategory = persistedAtom<AlgorithmCategory | null>(
    'algora:activeCategory',
    null,
);

export const $activeSortAlgorithm = persistedAtom<SortAlgorithmId>(
    'algora:activeSortAlgorithm',
    'bubble-sort',
);

export const $activeSearchAlgorithm = persistedAtom<SearchAlgorithmId>(
    'algora:activeSearchAlgorithm',
    'bfs',
);

export const $activeAlgorithmId = computed(
    [$activeCategory, $activeSortAlgorithm, $activeSearchAlgorithm],
    (category, sort, search) => (category === 'sorting' ? sort : search),
);

// ─── Playback controls ────────────────────────────────────────────────────────

export const $playState = atom<PlayState>('idle');
export const $speed = persistedAtom<Speed>('algora:speed', 1);
export const $currentStepIndex = atom<number>(0);

// ─── Sorting state ────────────────────────────────────────────────────────────

export const $sortSteps = atom<SortStep[]>([]);
export const $sortArraySize = persistedAtom<number>('algora:sortArraySize', 40);

export const $currentSortStep = computed(
    [$sortSteps, $currentStepIndex],
    (steps, idx) => steps[idx] ?? null,
);

// ─── Searching state ──────────────────────────────────────────────────────────

export const $searchSteps = atom<SearchStep[]>([]);
export const $mazeGrid = atom<MazeGrid | null>(null);
export const $mazeSize = persistedAtom<{ rows: number; cols: number }>(
    'algora:mazeSize',
    { rows: 21, cols: 35 },
);

export const $currentSearchStep = computed(
    [$searchSteps, $currentStepIndex],
    (steps, idx) => steps[idx] ?? null,
);

// ─── Derived ──────────────────────────────────────────────────────────────────

export const $totalSteps = computed(
    [$activeCategory, $sortSteps, $searchSteps],
    (cat, sort, search) => {
        if (cat === 'sorting') return sort.length;
        if (cat === 'searching') return search.length;
        return 0;
    },
);

export const $progress = computed(
    [$currentStepIndex, $totalSteps],
    (idx, total) => (total > 0 ? Math.round((idx / (total - 1)) * 100) : 0),
);

// ─── Actions ──────────────────────────────────────────────────────────────────

export function resetPlayback() {
    $playState.set('idle');
    $currentStepIndex.set(0);
}

/**
 * Switch the active category. Does NOT clear steps — visualiser components
 * manage their own step generation on mount / algorithm change.
 */
export function selectCategory(cat: AlgorithmCategory) {
    $activeCategory.set(cat);
    resetPlayback();
}

export function selectSortAlgorithm(id: SortAlgorithmId) {
    $activeSortAlgorithm.set(id);
    resetPlayback();
    $sortSteps.set([]);
}

export function selectSearchAlgorithm(id: SearchAlgorithmId) {
    $activeSearchAlgorithm.set(id);
    resetPlayback();
    $searchSteps.set([]);
}