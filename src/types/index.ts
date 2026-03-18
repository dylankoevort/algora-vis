// ─── Shared ───────────────────────────────────────────────────────────────────

export type Speed = 0.5 | 1 | 1.5 | 2 | 3;
export type PlayState = 'idle' | 'playing' | 'paused' | 'finished';
export type AlgorithmCategory = 'sorting' | 'searching';

// ─── Sorting ──────────────────────────────────────────────────────────────────

export type SortAlgorithmId =
    | 'bubble-sort'
    | 'merge-sort'
    | 'quick-sort'
    | 'insertion-sort'
    | 'selection-sort'
    | 'heap-sort';

export interface SortAlgorithmMeta {
    id: SortAlgorithmId;
    name: string;
    description: string;
    timeComplexity: { best: string; average: string; worst: string };
    spaceComplexity: string;
    stable: boolean;
}

export type SortBarState = 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot' | 'selected';

export interface SortBar {
    value: number;
    state: SortBarState;
}

export interface SortStep {
    bars: SortBar[];
    comparisons: number;
    swaps: number;
    description: string;
}

// ─── Searching / Pathfinding ──────────────────────────────────────────────────

export type SearchAlgorithmId = 'bfs' | 'dfs' | 'astar' | 'dijkstra';

export interface SearchAlgorithmMeta {
    id: SearchAlgorithmId;
    name: string;
    description: string;
    timeComplexity: string;
    spaceComplexity: string;
    optimal: boolean;
    complete: boolean;
}

export type CellType = 'empty' | 'wall' | 'start' | 'end' | 'visited' | 'frontier' | 'path';

export interface Cell {
    row: number;
    col: number;
    type: CellType;
    g: number; // cost from start (Dijkstra / A*)
    h: number; // heuristic (A*)
    f: number; // g + h
    parent: { row: number; col: number } | null;
}

export interface MazeGrid {
    cells: Cell[][];
    rows: number;
    cols: number;
    start: { row: number; col: number };
    end: { row: number; col: number };
}

export interface SearchStep {
    grid: Cell[][];
    visitedCount: number;
    frontierCount: number;
    description: string;
    pathFound?: boolean;
    pathLength?: number;
}