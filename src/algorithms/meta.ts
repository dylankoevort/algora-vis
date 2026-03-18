import type { SortAlgorithmMeta, SearchAlgorithmMeta } from '../types';

export const SORT_ALGORITHMS: SortAlgorithmMeta[] = [
    {
        id: 'bubble-sort',
        name: 'Bubble Sort',
        description:
            'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
        timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
        spaceComplexity: 'O(1)',
        stable: true,
    },
    {
        id: 'insertion-sort',
        name: 'Insertion Sort',
        description:
            'Builds the final sorted array one element at a time by inserting each element into its correct position.',
        timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
        spaceComplexity: 'O(1)',
        stable: true,
    },
    {
        id: 'selection-sort',
        name: 'Selection Sort',
        description:
            'Divides the array into a sorted and unsorted region, repeatedly selecting the smallest element from the unsorted region.',
        timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
        spaceComplexity: 'O(1)',
        stable: false,
    },
    {
        id: 'merge-sort',
        name: 'Merge Sort',
        description:
            'Divides the array into halves, recursively sorts them, then merges the sorted halves back together.',
        timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
        spaceComplexity: 'O(n)',
        stable: true,
    },
    {
        id: 'quick-sort',
        name: 'Quick Sort',
        description:
            'Selects a pivot element and partitions the array around the pivot, recursively sorting sub-arrays.',
        timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
        spaceComplexity: 'O(log n)',
        stable: false,
    },
    {
        id: 'heap-sort',
        name: 'Heap Sort',
        description:
            'Converts the array into a max-heap, then repeatedly extracts the maximum element to build the sorted array.',
        timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
        spaceComplexity: 'O(1)',
        stable: false,
    },
];

export const SEARCH_ALGORITHMS: SearchAlgorithmMeta[] = [
    {
        id: 'bfs',
        name: 'Breadth-First Search',
        description:
            'Explores all neighbours at the current depth before moving deeper. Guarantees the shortest path in unweighted graphs.',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
        optimal: true,
        complete: true,
    },
    {
        id: 'dfs',
        name: 'Depth-First Search',
        description:
            'Explores as far as possible along each branch before backtracking. Does not guarantee the shortest path.',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
        optimal: false,
        complete: true,
    },
    {
        id: 'astar',
        name: 'A* Search',
        description:
            'Uses a heuristic (Manhattan distance) to guide search towards the goal. Optimal when the heuristic is admissible.',
        timeComplexity: 'O(E log V)',
        spaceComplexity: 'O(V)',
        optimal: true,
        complete: true,
    },
    {
        id: 'dijkstra',
        name: "Dijkstra's Algorithm",
        description:
            'Finds the shortest path by greedily visiting the node with the lowest cumulative cost. Optimal for non-negative weights.',
        timeComplexity: 'O((V + E) log V)',
        spaceComplexity: 'O(V)',
        optimal: true,
        complete: true,
    },
];

export const getSortMeta = (id: string) => SORT_ALGORITHMS.find((a) => a.id === id)!;
export const getSearchMeta = (id: string) => SEARCH_ALGORITHMS.find((a) => a.id === id)!;