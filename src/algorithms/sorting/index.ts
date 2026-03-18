import type { SortAlgorithmId, SortStep } from '../../types';
import { generateBubbleSortSteps } from './bubbleSort';
import { generateInsertionSortSteps } from './insertionSort';
import { generateSelectionSortSteps } from './selectionSort';
import { generateMergeSortSteps } from './mergeSort';
import { generateQuickSortSteps } from './quickSort';
import { generateHeapSortSteps } from './heapSort';

export function runSortAlgorithm(id: SortAlgorithmId, values: number[]): SortStep[] {
    switch (id) {
        case 'bubble-sort':
            return generateBubbleSortSteps(values);
        case 'insertion-sort':
            return generateInsertionSortSteps(values);
        case 'selection-sort':
            return generateSelectionSortSteps(values);
        case 'merge-sort':
            return generateMergeSortSteps(values);
        case 'quick-sort':
            return generateQuickSortSteps(values);
        case 'heap-sort':
            return generateHeapSortSteps(values);
    }
}

export function generateRandomArray(size: number, min = 4, max = 100): number[] {
    return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}